from typing import List, Optional
from lexer import Token, Lexer
from ast_nodes import *

class ParseError(Exception):
    pass

class Parser:
    def __init__(self, tokens: List[Token]):
        self.tokens = tokens
        self.pos = 0

    def current(self) -> Optional[Token]:
        if self.pos < len(self.tokens):
            return self.tokens[self.pos]
        return None

    def peek(self) -> Optional[Token]:
        if self.pos + 1 < len(self.tokens):
            return self.tokens[self.pos + 1]
        return None

    def advance(self):
        self.pos += 1

    def match(self, token_type: str) -> bool:
        curr = self.current()
        if curr and curr.type == token_type:
            self.advance()
            return True
        return False

    def expect(self, token_type: str) -> Token:
        curr = self.current()
        if curr and curr.type == token_type:
            self.advance()
            return curr
        raise ParseError(f"Expected {token_type}, but got {curr.type if curr else 'EOF'} at line {curr.line if curr else 'EOF'}")

    def parse(self) -> Program:
        statements = []
        while self.current():
            statements.append(self.parse_statement())
        line = statements[0].line if statements else 1
        col = statements[0].column if statements else 0
        return Program(line, col, statements)

    def _is_function_def(self) -> bool:
        curr = self.current()
        if not curr: return False
        if curr.type == 'NEW':
            return True
        if curr.type == 'LPAREN':
            p = self.pos + 1
            paren_depth = 1
            while p < len(self.tokens):
                tok = self.tokens[p]
                if tok.type == 'LPAREN':
                    paren_depth += 1
                elif tok.type == 'RPAREN':
                    paren_depth -= 1
                    if paren_depth == 0:
                        if p + 2 < len(self.tokens):
                            if self.tokens[p+1].type == 'STREAM_OP' and self.tokens[p+2].type == 'NEW':
                                return True
                        return False
                p += 1
        return False

    def _is_implicit_target(self, node):
        """Check if the root target of an IndexAccessNode is an ImplicitVariableNode."""
        if isinstance(node, ImplicitVariableNode):
            return True
        if isinstance(node, IndexAccessNode):
            return self._is_implicit_target(node.target)
        return False

    def _expect_dot_or_block_end(self, pipeline: Pipeline):
        if self.current() and self.current().type == 'DOT':
            self.advance()
            return True

        # Allow inline blocks: if next token is END (..), the block is closing
        # so the last pipeline doesn't need a trailing DOT
        if self.current() and self.current().type in ('END', 'IS', 'ELSE', 'RPAREN', 'RBRACKET', 'RBRACE'):
            return True
            
        if hasattr(pipeline, 'nodes') and len(pipeline.nodes) > 0:
            last_node = pipeline.nodes[-1]
            if isinstance(last_node, (CheckBlock, CatchBlock, LoopBlock, StreamBlockNode, FunctionDefNode)):
                return True
                
        return False

    def parse_statement(self) -> ASTNode:
        if self._is_function_def():
            return self.parse_function_def()
        
        # Otherwise, it's a pipeline
        pipeline = self.parse_pipeline()
        if not self._expect_dot_or_block_end(pipeline):
            self.expect('DOT')
        return pipeline

    def parse_block(self, end_tokens) -> BlockNode:
        pipelines = []
        curr = self.current()
        line = curr.line if curr else 1
        col = curr.column if curr else 0
        while self.current() and self.current().type not in end_tokens:
            pipeline = self.parse_pipeline()
            if not self._expect_dot_or_block_end(pipeline):
                self.expect('DOT')
            pipelines.append(pipeline)
        return BlockNode(line, col, pipelines)

    def parse_pipeline(self) -> Pipeline:
        curr = self.current()
        line, col = curr.line, curr.column
        
        nodes = [self.parse_node()]
        ops = []
        
        while self.current() and self.current().type == 'STREAM_OP':
            op = self.current().value
            ops.append(op)
            self.advance()
            
            # Check for Keyword Block (e.g. >> map:)
            curr = self.current()
            if curr and curr.type == 'VERB' and curr.value in ('Map', 'Filter', 'Reduce', 'Fork', 'Zip', 'Sort', 'Group', 'Loop', 'Check', 'Do', 'Update'):
                # Only parse as StreamBlockNode if followed by optional (var1, var2) or var1, and a COLON
                p = 1
                if self.pos + p < len(self.tokens) and self.tokens[self.pos + p].type == 'LPAREN':
                    p += 1
                    while self.pos + p < len(self.tokens) and self.tokens[self.pos + p].type in ('VARIABLE', 'IMPLICIT_VAR', 'IDENTIFIER', 'VERB', 'COMMA'):
                        p += 1
                    if self.pos + p < len(self.tokens) and self.tokens[self.pos + p].type == 'RPAREN':
                        p += 1
                elif self.pos + p < len(self.tokens) and self.tokens[self.pos + p].type in ('VARIABLE', 'IMPLICIT_VAR', 'IDENTIFIER', 'VERB'):
                    p += 1

                if self.pos + p < len(self.tokens) and self.tokens[self.pos + p].type == 'COLON':
                    kw_type = curr.value
                    kw_line, kw_col = curr.line, curr.column
                    self.advance()

                    var_names = []
                    if self.current() and self.current().type == 'LPAREN':
                        self.advance() # consume LPAREN
                        while self.current() and self.current().type in ('VARIABLE', 'IMPLICIT_VAR', 'IDENTIFIER', 'VERB'):
                            var_names.append(self.current().value)
                            self.advance()
                            if self.current() and self.current().type == 'COMMA':
                                self.advance()
                        self.expect('RPAREN')
                    else:
                        while self.current() and self.current().type in ('VARIABLE', 'IMPLICIT_VAR', 'IDENTIFIER', 'VERB'):
                            var_names.append(self.current().value)
                            self.advance()

                    if not var_names:
                        var_names = ['@']

                    self.expect('COLON')
                    block = self.parse_block({'END'})
                    self.expect('END')
                    step = StreamBlockNode(kw_line, kw_col, kw_type, var_names, block)
                else:
                    step = self.parse_node()
                    if op == '>>':
                        if isinstance(step, VariableNode):
                            step = BindNode(step.line, step.column, step, None)
                        elif isinstance(step, IndexAccessNode) and not self._is_implicit_target(step):
                            step = BindNode(step.line, step.column, step, None)
                        elif isinstance(step, BundleNode) and all(isinstance(i, VariableNode) for i in step.items):
                            step = DestructuringBindNode(step.line, step.column, [i.name for i in step.items])
            elif self.current() and self.current().type == 'COLON':
                step_line, step_col = self.current().line, self.current().column
                self.advance() # consume COLON
                block = self.parse_block({'END'})
                self.expect('END')
                step = StreamBlockNode(step_line, step_col, 'tap', ['@'], block)
            elif self.current() and self.current().type == 'IMPLICIT_VAR' and self.peek() and self.peek().type == 'COLON':
                var_name = self.current().value
                step_line, step_col = self.current().line, self.current().column
                self.advance() # consume IMPLICIT_VAR
                self.advance() # consume COLON
                block = self.parse_block({'END'})
                self.expect('END')
                step = StreamBlockNode(step_line, step_col, 'tap', [var_name], block)
            else:
                step = self.parse_node()
                if op == '>>':
                    if isinstance(step, VariableNode):
                        step = BindNode(step.line, step.column, step, None)
                    elif isinstance(step, IndexAccessNode) and not self._is_implicit_target(step):
                        step = BindNode(step.line, step.column, step, None)
                    elif isinstance(step, BundleNode) and all(isinstance(i, VariableNode) for i in step.items):
                        step = DestructuringBindNode(step.line, step.column, [i.name for i in step.items])
            nodes.append(step)
            
        return Pipeline(line, col, nodes, ops)

    def parse_node(self) -> ASTNode:
        curr = self.current()
        line, col = curr.line, curr.column

        # Check for type binding without 'as' (e.g. `int count`)
        if curr.type in ('INT', 'STR', 'BOOL', 'LIST', 'DICT'):
            type_name = curr.value.lower()
            self.advance()
            var_token = self.expect('VARIABLE')
            return BindNode(line, col, VariableNode(var_token.line, var_token.column, var_token.value), type_name)

        # Bundle Check
        # To handle A & B, we parse an expression first, then check for &
        expr = self.parse_expression()
        
        if self.current() and self.current().type == 'OPERATOR' and self.current().value == '&':
            items = [expr]
            while self.current() and self.current().type == 'OPERATOR' and self.current().value == '&':
                self.advance() # consume &
                items.append(self.parse_expression())
            return BundleNode(line, col, items)
            
        return expr

    def parse_expression(self) -> ASTNode:
        curr = self.current()
        line, col = curr.line, curr.column

        if curr.type == 'MUST':
            self.advance()
            self.expect('BE')
            type_token = self.current()
            if type_token.type not in ('INT', 'STR', 'BOOL', 'LIST', 'DICT'):
                raise ParseError(f"Expected type after 'must be', got {type_token.type}")
            self.advance()
            return MustBeNode(line, col, type_token.value.lower())

        if curr.type == 'CHECK':
            self.advance()
            self.expect('COLON')
            branches = []
            while self.current() and self.current().type in ('IS', 'ELSE'):
                if self.match('IS'):
                    if self.current() and self.current().type == 'OPERATOR':
                        implicit_left = ImplicitVariableNode(line, col, '@')
                        cond = self.parse_or(left_node=implicit_left)
                    else:
                        cond = self.parse_expression()
                    
                    self.expect('COLON')
                    block = self.parse_block({'IS', 'ELSE', 'END'})
                    branches.append(Branch(line, col, cond, block))
                elif self.match('ELSE'):
                    self.expect('COLON')
                    block = self.parse_block({'END'})
                    branches.append(Branch(curr.line, curr.column, None, block))
            self.expect('END')
            return CheckBlock(line, col, branches)

        if curr.type == 'FORK':
            self.advance()
            self.expect('COLON')
            block = self.parse_block({'END'})
            self.expect('END')
            return ForkBlock(line, col, block)
            
        if (curr.type in ('CATCH', 'VERB') and curr.value in ('Catch', 'catch')) or curr.type == 'CATCH':
            kw_line, kw_col = curr.line, curr.column
            self.advance()
            var_name = None
            if self.current() and self.current().type == 'LPAREN':
                self.advance()
                if self.current() and self.current().type in ('VARIABLE', 'IMPLICIT_VAR'):
                    var_name = self.current().value.lstrip('@')
                    self.advance()
                self.expect('RPAREN')
            self.expect('COLON')
            block = self.parse_block({'END'})
            self.expect('END')
            return CatchBlock(kw_line, kw_col, block, var_name)
            
        if curr.type == 'LOOP':
            self.advance()
            self.expect('COLON')
            block = self.parse_block({'END'})
            self.expect('END')
            return LoopBlock(line, col, block)
            
        if curr.type == 'BREAK':
            self.advance()
            return BreakNode(line, col)
            
        if curr.type == 'JOIN':
            self.advance()
            mode = 'flat'
            if self.match('PACK'):
                mode = 'pack'
            elif self.match('FLAT'):
                mode = 'flat'
            return JoinNode(line, col, mode)

        return self.parse_or()

    def parse_or(self, left_node=None) -> ASTNode:
        left = self.parse_and(left_node=left_node)
        while self.current() and (self.current().value in ('||', 'or') or self.current().type == 'OR'):
            op = self.current().value
            line, col = self.current().line, self.current().column
            self.advance()
            right = self.parse_and()
            left = ExpressionNode(line, col, left, op, right)
        if self.current() and self.current().value == '|':
            line, col = self.current().line, self.current().column
            raise ParseError(f"Use '||' or 'or' for logical OR. '|' is reserved for bitwise operations at line {line}")
        return left

    def parse_and(self, left_node=None) -> ASTNode:
        left = self.parse_comp(left_node=left_node)
        while self.current() and (self.current().value in ('&&', 'and', '&') or self.current().type == 'AND'):
            op = self.current().value
            line, col = self.current().line, self.current().column
            self.advance()
            right = self.parse_comp()
            left = ExpressionNode(line, col, left, op, right)
        return left

    def parse_comp(self, left_node=None) -> ASTNode:
        left = left_node if left_node else self.parse_primary()
        while self.current() and self.current().type == 'OPERATOR' and self.current().value not in ('&', '&&', '||'):
            op = self.current().value
            line, col = self.current().line, self.current().column
            self.advance()
            right = self.parse_primary()
            left = ExpressionNode(line, col, left, op, right)
        return left

    def _parse_base_primary(self) -> ASTNode:
        curr = self.current()
        line, col = curr.line, curr.column

        if (curr.type == 'OPERATOR' and curr.value in ('-', '!')) or curr.type == 'NOT':
            op = curr.value if curr.type == 'OPERATOR' else 'not'
            self.advance()
            right = self.parse_primary()
            return UnaryOpNode(line, col, op, right)

        if curr.type == 'DOUBLE_COLON':
            # Do NOT advance. parse_primary will consume the DOUBLE_COLON
            return ImplicitVariableNode(line, col, '@')

        if curr.type == 'NUMBER':
            self.advance()
            return LiteralNode(line, col, curr.value)
        if curr.type == 'STRING':
            self.advance()
            val = curr.value
            if isinstance(val, str) and '{' in val and '}' in val:
                parts = []
                last_idx = 0
                i = 0
                has_expr = False
                while i < len(val):
                    if val[i] == '{' and (i == 0 or val[i-1] != '\\'):
                        if i > last_idx:
                            parts.append(val[last_idx:i])
                        brace_count = 1
                        j = i + 1
                        while j < len(val):
                            if val[j] == '{' and val[j-1] != '\\':
                                brace_count += 1
                            elif val[j] == '}' and val[j-1] != '\\':
                                brace_count -= 1
                                if brace_count == 0:
                                    break
                            j += 1
                        if brace_count == 0:
                            expr_str = val[i+1:j]
                            from lexer import Lexer
                            sub_lexer = Lexer(expr_str)
                            sub_tokens = sub_lexer.tokenize()
                            if sub_tokens:
                                sub_parser = Parser(sub_tokens)
                                parts.append(sub_parser.parse_pipeline())
                                has_expr = True
                            i = j
                            last_idx = i + 1
                    i += 1
                if has_expr:
                    if last_idx < len(val):
                        parts.append(val[last_idx:])
                    return InterpolatedStringNode(line, col, parts)
            return LiteralNode(line, col, val)
        if curr.type in ('TRUE', 'FALSE', 'NULL'):
            self.advance()
            if curr.type == 'NULL':
                return LiteralNode(line, col, None)
            return LiteralNode(line, col, True if curr.type == 'TRUE' else False)
        if curr.type == 'VARIABLE':
            self.advance()
            return VariableNode(line, col, curr.value)
        if curr.type == 'IMPLICIT_VAR':
            self.advance()
            return ImplicitVariableNode(line, col, curr.value)
        if curr.type == 'FSTRING':
            self.advance()
            val = curr.value[2:-1]
            parts = []
            last_idx = 0
            i = 0
            while i < len(val):
                if val[i] == '{' and (i == 0 or val[i-1] != '\\'):
                    if i > last_idx:
                        parts.append(val[last_idx:i])
                    brace_count = 1
                    j = i + 1
                    while j < len(val):
                        if val[j] == '{' and val[j-1] != '\\':
                            brace_count += 1
                        elif val[j] == '}' and val[j-1] != '\\':
                            brace_count -= 1
                            if brace_count == 0:
                                break
                        j += 1
                    if brace_count == 0:
                        expr_str = val[i+1:j]
                        from lexer import Lexer
                        sub_lexer = Lexer(expr_str)
                        sub_tokens = sub_lexer.tokenize()
                        if sub_tokens:
                            sub_parser = Parser(sub_tokens)
                            parts.append(sub_parser.parse_pipeline())
                        i = j
                        last_idx = i + 1
                i += 1
            if last_idx < len(val):
                parts.append(val[last_idx:])
            return InterpolatedStringNode(line, col, parts)
        if curr.type == 'LBRACKET':
            self.advance()
            items = []
            while not self.match('RBRACKET'):
                items.append(self.parse_pipeline())
                self.match('COMMA')
            return ListNode(line, col, items) if hasattr(self, 'ListNode') else LiteralNode(line, col, items)

        if curr.type == 'LBRACE':
            self.advance()
            keys = []
            values = []
            while not self.match('RBRACE'):
                key_token = self.expect('STRING')
                keys.append(key_token.value)
                self.expect('COLON')
                values.append(self.parse_pipeline())
                self.match('COMMA')
            return DictNode(line, col, keys, values)
            
        if curr.type == 'LPAREN':
            self.advance()
            first = self.parse_pipeline()
            if self.current() and self.current().type == 'COMMA':
                items = [first]
                while self.current() and self.current().type == 'COMMA':
                    self.advance() # consume COMMA
                    if self.current() and self.current().type == 'RPAREN':
                        break
                    items.append(self.parse_pipeline())
                self.expect('RPAREN')
                return BundleNode(line, col, items)
            else:
                self.expect('RPAREN')
                return first

        if curr.type == 'VERB':
            self.advance()
            if curr.value == 'Return':
                return ReturnNode(line, col)
            args = []
            if self.current() and self.current().type == 'LPAREN':
                self.advance()
                while self.current() and self.current().type != 'RPAREN':
                    args.append(self.parse_pipeline())
                    if self.current() and self.current().type == 'COMMA':
                        self.advance()
                self.expect('RPAREN')
            return FunctionCallNode(line, col, curr.value, args) if args else FunctionCallNode(line, col, curr.value)

        raise ParseError(f"Unexpected token {curr.type} ({curr.value}) at line {line}")

    def parse_primary(self) -> ASTNode:
        curr = self.current()
        line = curr.line if curr else 1
        col = curr.column if curr else 0
        node = self._parse_base_primary()
        while self.current() and self.current().type in ('LBRACKET', 'DOUBLE_COLON'):
            if self.current().type == 'LBRACKET':
                self.advance()
                idx = self.parse_expression()
                self.expect('RBRACKET')
                node = IndexAccessNode(line, col, node, idx)
            elif self.current().type == 'DOUBLE_COLON':
                self.advance()
                prop_token = self.current()
                if prop_token and prop_token.type in ('VARIABLE', 'NUMBER', 'IDENTIFIER', 'VERB'):
                    self.advance()
                    idx = LiteralNode(prop_token.line, prop_token.column,
                                      int(prop_token.value) if prop_token.type == 'NUMBER' else prop_token.value)
                    node = IndexAccessNode(line, col, node, idx)
                else:
                    raise ParseError(f"Expected property name or number after ::, got {prop_token.type if prop_token else 'EOF'}")
        return node

    def parse_function_def(self) -> FunctionDefNode:
        # (int a & int b) >> new Plus: ... end.
        # or new Plus: ... end.
        curr = self.current()
        line, col = curr.line, curr.column
        
        params = []
        if self.match('LPAREN'):
            # parse parameters
            if not self.match('RPAREN'):
                while True:
                    type_token = self.current()
                    if type_token.type in ('INT', 'STR', 'BOOL', 'LIST', 'DICT'):
                        param_type = type_token.value.lower()
                        self.advance()
                        var_name = self.expect('VARIABLE').value
                    elif type_token.type == 'VARIABLE':
                        param_type = 'any'
                        var_name = type_token.value
                        self.advance()
                    else:
                        raise ParseError(f"Expected type or variable in function def, got {type_token.type}")
                    
                    params.append(ParamDef(param_type, var_name))
                    
                    if self.current() and (self.current().type == 'COMMA' or (self.current().type == 'OPERATOR' and self.current().value == '&')):
                        self.advance()
                    else:
                        break
                self.expect('RPAREN')
            self.expect('STREAM_OP')
            
        self.expect('NEW')
        name = self.expect('VERB').value
        self.expect('COLON')

        block = self.parse_block({'END'})
        self.expect('END')

        return FunctionDefNode(line, col, name, params, block)
