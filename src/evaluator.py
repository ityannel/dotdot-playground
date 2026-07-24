from ast_nodes import *
from environment import Environment
import json
import os

class EvaluatorError(Exception):
    pass

class PopPopError(EvaluatorError):
    def __init__(self, err_type, message):
        self.err_type = err_type
        self.message = message
        super().__init__(f"{err_type}: {message}")

class ReturnException(BaseException):
    def __init__(self, value):
        self.value = value

class BreakException(BaseException):
    def __init__(self, value):
        self.value = value

class Evaluator:
    def __init__(self):
        self.global_env = Environment()
        self.trace_path = os.environ.get('POPPOP_TRACE_FILE')

    def trace_pipeline_value(self, node, value, input_value=None, progress=None):
        """Emit optional, compact execution data for the VS Code flow view."""
        if not self.trace_path:
            return
        try:
            def display(current):
                preview = json.dumps(current, ensure_ascii=False, default=str)
                if len(preview) > 180:
                    preview = preview[:177] + "..."
                type_names = {str: "Str", int: "Num", float: "Num", bool: "Bool", list: "List", dict: "Dict", type(None): "Null"}
                return f"{preview} ({type_names.get(type(current), type(current).__name__)})"
            event = {
                "line": getattr(node, "line", 0),
                "stage": getattr(node, "name", getattr(node, "stream_type", type(node).__name__)),
                "after": display(value)
            }
            if input_value is not None:
                event["before"] = display(input_value)
            if progress:
                event["progress"] = progress
            with open(self.trace_path, 'a', encoding='utf-8') as trace_file:
                trace_file.write(json.dumps(event, ensure_ascii=False) + "\n")
        except Exception:
            pass

    async def eval(self, node: ASTNode, env: Environment) -> Any:
        method_name = f'eval_{type(node).__name__}'
        visitor = getattr(self, method_name, self.generic_eval)
        return await visitor(node, env)

    async def generic_eval(self, node: ASTNode, env: Environment):
        raise EvaluatorError(f"No eval method for {type(node).__name__}")

    async def eval_Program(self, node: Program, env: Environment):
        result = None
        for stmt in node.statements:
            if isinstance(stmt, FunctionDefNode):
                env.set_function(stmt.name, stmt)
            else:
                result = await self.eval(stmt, env)
        return result

    async def eval_Pipeline(self, node: Pipeline, env: Environment):
        if len(node.nodes) == 1 and isinstance(node.nodes[0], VariableNode) and node.nodes[0].name == 'Break':
            raise BreakException(None)
            
        i = 1
        try:
            val = await self.eval(node.nodes[0], env)
        except Exception as e:
            catch_idx = -1
            for j in range(1, len(node.nodes)):
                op_j = node.ops[j-1] if hasattr(node, 'ops') and j-1 < len(node.ops) else '>>'
                if op_j == '>~>' or isinstance(node.nodes[j], CatchBlock):
                    catch_idx = j
                    break
            if catch_idx != -1:
                op_catch = node.ops[catch_idx-1] if hasattr(node, 'ops') and catch_idx-1 < len(node.ops) else '>>'
                if op_catch == '>~>':
                    val = await self.eval(node.nodes[catch_idx], env)
                else:
                    err_dict = {"type": type(e).__name__, "message": str(e)}
                    if hasattr(e, 'err_type'): err_dict['type'] = e.err_type
                    env.set_current(err_dict)
                    val = await self.eval(node.nodes[catch_idx], env)
                env.set_current(val)
                i = catch_idx + 1
            else:
                raise e

        env.set_current(val)
        self.trace_pipeline_value(node.nodes[0], val)
        
        while i < len(node.nodes):
            n = node.nodes[i]
            op = node.ops[i-1] if hasattr(node, 'ops') and i-1 < len(node.ops) else '>>'
            
            if op in ('>!>', '>~>') or isinstance(n, CatchBlock):
                i += 1
                continue
                
            try:
                input_value = val
                if op == '>?>':
                    if val is None:
                        break
                    val = await self.eval(n, env)
                elif op == '>~>':
                    # If we reached here without error, skip the fallback
                    i += 1
                    continue
                elif op == '>!>': # Tap stream
                    if isinstance(n, StreamBlockNode):
                        if not isinstance(val, list): raise EvaluatorError("Tap stream block requires a list")
                        for item_index, item in enumerate(val, start=1):
                            self.trace_pipeline_value(n, item, progress=f"{item_index} / {len(val)}")
                            item_env = Environment(parent=env)
                            item_env.set_current(item)
                            var_name = n.var_names[0].lstrip('@') if n.var_names else ''
                            if var_name: item_env.set_var(var_name, item)
                            try:
                                await self.eval(n.block, item_env)
                            except BreakException:
                                break
                    else:
                        await self.eval(n, env)
                elif op == '>+>':
                    target = await self.eval(n, env)
                    if isinstance(target, list):
                        target.append(val)
                    elif isinstance(target, str):
                        target += str(val)
                        if isinstance(n, VariableNode): env.set_var(n.name, target)
                    else:
                        raise EvaluatorError("Append stream >+> requires list or string target")
                    val = target
                elif op == '>>' and isinstance(n, StreamBlockNode):
                    if n.stream_type == 'Map':
                        if isinstance(val, dict):
                            val = [[k, v] for k, v in val.items()]
                        elif not isinstance(val, list): raise EvaluatorError("Map stream requires a list")
                        mapped = []
                        for item_index, item in enumerate(val, start=1):
                            self.trace_pipeline_value(n, item, progress=f"{item_index} / {len(val)}")
                            item_env = Environment(parent=env)
                            item_env.set_current(item)
                            var_name = n.var_names[0].lstrip('@') if n.var_names else ''
                            if var_name: item_env.set_var(var_name, item)
                            try:
                                mapped.append(await self.eval(n.block, item_env))
                            except ReturnException as e:
                                mapped.append(e.value)
                            except BreakException as e:
                                mapped.append(e.value)
                                break
                        val = mapped
                    elif n.stream_type == 'Filter':
                        if not isinstance(val, list): raise EvaluatorError("Filter stream requires a list")
                        filtered = []
                        for item in val:
                            item_env = Environment(parent=env)
                            item_env.set_current(item)
                            var_name = n.var_names[0].lstrip('@') if n.var_names else ''
                            if var_name: item_env.set_var(var_name, item)
                            try:
                                res = await self.eval(n.block, item_env)
                            except ReturnException as e:
                                res = e.value
                            except BreakException as e:
                                res = e.value
                            if res: filtered.append(item)
                        val = filtered
                    elif n.stream_type == 'Reduce':
                        if not isinstance(val, list) or len(val) == 0: raise EvaluatorError("Reduce stream requires non-empty list")
                        res = val[0]
                        for item in val[1:]:
                            item_env = Environment(parent=env)
                            item_env.set_current([res, item])
                            acc_var = n.var_names[0].lstrip('@') if len(n.var_names) > 0 else 'acc'
                            item_var = n.var_names[1].lstrip('@') if len(n.var_names) > 1 else 'item'
                            if acc_var: item_env.set_var(acc_var, res)
                            if item_var: item_env.set_var(item_var, item)
                            try:
                                res = await self.eval(n.block, item_env)
                            except ReturnException as e:
                                res = e.value
                        val = res
                    elif n.stream_type == 'Zip':
                        if not isinstance(val, list) or not all(isinstance(arr, list) for arr in val):
                            raise EvaluatorError("Zip stream requires a bundle of arrays")
                        zipped = []
                        min_len = min(len(arr) for arr in val) if val else 0
                        for idx in range(min_len):
                            item_env = Environment(parent=env)
                            items = [arr[idx] for arr in val]
                            item_env.set_current(items)
                            for v_idx, var_name in enumerate(n.var_names):
                                name = var_name.lstrip('@')
                                if name and v_idx < len(items):
                                    item_env.set_var(name, items[v_idx])
                            try:
                                zipped.append(await self.eval(n.block, item_env))
                            except ReturnException as e:
                                zipped.append(e.value)
                            except BreakException as e:
                                zipped.append(e.value)
                                break
                        val = zipped
                    elif n.stream_type == 'Sort':
                        if not isinstance(val, list): raise EvaluatorError("Sort stream requires a list")
                        decorated = []
                        for item in val:
                            item_env = Environment(parent=env)
                            item_env.set_current(item)
                            var_name = n.var_names[0].lstrip('@') if n.var_names else ''
                            if var_name: item_env.set_var(var_name, item)
                            try:
                                key = await self.eval(n.block, item_env)
                                decorated.append((key, item))
                            except ReturnException as e:
                                decorated.append((e.value, item))
                        decorated.sort(key=lambda x: x[0])
                        val = [item for key, item in decorated]
                    elif n.stream_type == 'Group':
                        if not isinstance(val, list): raise EvaluatorError("Group stream requires a list")
                        grouped = {}
                        for item in val:
                            item_env = Environment(parent=env)
                            item_env.set_current(item)
                            var_name = n.var_names[0].lstrip('@') if n.var_names else ''
                            if var_name: item_env.set_var(var_name, item)
                            try:
                                key = await self.eval(n.block, item_env)
                            except ReturnException as e:
                                key = e.value
                            if key not in grouped: grouped[key] = []
                            grouped[key].append(item)
                        val = grouped
                    elif n.stream_type == 'Fork':
                        results = []
                        for pipeline in n.block.pipelines:
                            fork_env = Environment(parent=env)
                            fork_env.set_current(val)
                            results.append(await self.eval(pipeline, fork_env))
                    elif n.stream_type in ('Loop', 'Do'):
                        items = val if isinstance(val, list) else range(int(val)) if isinstance(val, (int, float)) else [val]
                        last_res = None
                        for item in items:
                            loop_env = Environment(parent=env)
                            loop_env.set_current(item)
                            var_name = n.var_names[0].lstrip('@') if n.var_names else ''
                            if var_name: loop_env.set_var(var_name, item)
                            try:
                                last_res = await self.eval(n.block, loop_env)
                            except ReturnException as e:
                                last_res = e.value
                                break
                            except BreakException:
                                break
                        val = last_res
                    elif n.stream_type == 'Update':
                        if not isinstance(val, dict): raise EvaluatorError("Update stream requires a dictionary")
                        new_dict = dict(val)
                        from pop_builtins import DROP_SIGNAL
                        for statement in n.block.pipelines:
                            if hasattr(statement, 'nodes') and len(statement.nodes) > 0:
                                target_node = statement.nodes[0]
                                keys_to_update = []
                                
                                def get_implicit_key(node):
                                    from ast_nodes import IndexAccessNode, ImplicitVariableNode, LiteralNode
                                    if isinstance(node, IndexAccessNode) and isinstance(node.target, ImplicitVariableNode) and isinstance(node.index, LiteralNode):
                                        return node.index.value
                                    return None

                                key = get_implicit_key(target_node)
                                if key:
                                    keys_to_update.append(key)
                                else:
                                    from ast_nodes import BundleNode
                                    if isinstance(target_node, BundleNode):
                                        for item_pipeline in target_node.items:
                                            if hasattr(item_pipeline, 'nodes') and len(item_pipeline.nodes) > 0:
                                                k = get_implicit_key(item_pipeline.nodes[0])
                                                if k: keys_to_update.append(k)

                                if keys_to_update:
                                    from ast_nodes import BundleNode, Pipeline
                                    import copy
                                    
                                    if isinstance(target_node, BundleNode):
                                        valid_items = [item for item in target_node.items if hasattr(item, 'nodes') and len(item.nodes) > 0 and get_implicit_key(item.nodes[0])]
                                        for k, item_pipeline in zip(keys_to_update, valid_items):
                                            stmt_copy = copy.copy(statement)
                                            stmt_copy.nodes = [item_pipeline.nodes[0]] + statement.nodes[1:]
                                            update_env = Environment(parent=env)
                                            update_env.set_current(val)
                                            res = await self.eval(stmt_copy, update_env)
                                            if res is DROP_SIGNAL:
                                                if k in new_dict:
                                                    del new_dict[k]
                                            else:
                                                new_dict[k] = res
                                    else:
                                        update_env = Environment(parent=env)
                                        update_env.set_current(val)
                                        res = await self.eval(statement, update_env)
                                        for k in keys_to_update:
                                            if res is DROP_SIGNAL:
                                                if k in new_dict:
                                                    del new_dict[k]
                                            else:
                                                new_dict[k] = res
                                else:
                                    update_env = Environment(parent=env)
                                    update_env.set_current(val)
                                    await self.eval(statement, update_env)
                            else:
                                update_env = Environment(parent=env)
                                update_env.set_current(val)
                                await self.eval(statement, update_env)
                        val = new_dict
                    else:
                        raise EvaluatorError(f"Unknown stream block type {n.stream_type}")
                else:
                    val = await self.eval(n, env)
                    
                env.set_current(val)
                self.trace_pipeline_value(n, val, input_value)
                i += 1
            except Exception as e:
                catch_idx = -1
                for j in range(i + 1, len(node.nodes)):
                    op_j = node.ops[j-1] if hasattr(node, 'ops') and j-1 < len(node.ops) else '>>'
                    if op_j in ('>!>', '>~>') or isinstance(node.nodes[j], CatchBlock):
                        catch_idx = j
                        break
                if catch_idx != -1:
                    op_catch = node.ops[catch_idx-1] if hasattr(node, 'ops') and catch_idx-1 < len(node.ops) else '>>'
                    if op_catch in ('>!>', '>~>'):
                        val = await self.eval(node.nodes[catch_idx], env)
                    else:
                        err_dict = {"type": type(e).__name__, "message": str(e)}
                        if hasattr(e, 'err_type'): err_dict['type'] = e.err_type
                        catch_node = node.nodes[catch_idx]
                        catch_env = Environment(parent=env)
                        catch_env.set_current(err_dict)
                        if hasattr(catch_node, 'var_name') and catch_node.var_name:
                            catch_env.set_var(catch_node.var_name, err_dict)
                        val = await self.eval(catch_node, catch_env)
                    env.set_current(val)
                    i = catch_idx + 1
                else:
                    raise e
                    
        return val
    async def eval_BlockNode(self, node: BlockNode, env: Environment):
        val = env.get_current()
        for pipeline in node.pipelines:
            val = await self.eval(pipeline, env)
            env.set_current(val)
        return val

    async def eval_DictNode(self, node: DictNode, env: Environment):
        result = {}
        for k, v in zip(node.keys, node.values):
            result[k] = await self.eval(v, env)
        return result

    async def eval_LiteralNode(self, node: LiteralNode, env: Environment):
        if isinstance(node.value, list):
            return [await self.eval(item, env) if isinstance(item, ASTNode) else item for item in node.value]
        if isinstance(node.value, str) and '{' in node.value and '}' in node.value:
            import re
            def repl(match):
                var_name = match.group(1)
                try:
                    val = env.get_var(var_name)
                    return str(val) if val is not None else 'null'
                except:
                    return match.group(0)
            return re.sub(r'\{([A-Za-z_][A-Za-z0-9_]*)\}', repl, node.value)
        return node.value

    async def eval_UnaryOpNode(self, node: UnaryOpNode, env: Environment):
        right = await self.eval(node.right, env)
        if node.operator == '-':
            if isinstance(right, (int, float)):
                return -right
            raise EvaluatorError(f"Cannot negate non-number: {type(right)}")
        elif node.operator in ('!', 'not'):
            return not bool(right)
        raise EvaluatorError(f"Unknown unary operator: {node.operator}")

    async def eval_VariableNode(self, node: VariableNode, env: Environment):
        return env.get_var(node.name)

    async def eval_ImplicitVariableNode(self, node: ImplicitVariableNode, env: Environment):
        if node.name != '@':
            var_name = node.name.lstrip('@')
            try:
                return env.get_var(var_name)
            except Exception:
                pass
        return env.get_current()

    async def eval_ExpressionNode(self, node: ExpressionNode, env: Environment):
        left = await self.eval(node.left, env)
        right = await self.eval(node.right, env)
        op = node.operator
        if op == '+':
            if isinstance(left, str) or isinstance(right, str):
                return str(left) + str(right)
            return left + right
        if op == '-': return left - right
        if op == '*': return left * right
        if op == '/':
            if right == 0: raise EvaluatorError("Division by zero")
            return left / right
        if op == '%':
            if right == 0: raise EvaluatorError("Modulo by zero")
            return left % right
        if op == '>': return left > right
        if op == '<': return left < right
        if op == '>=': return left >= right
        if op == '<=': return left <= right
        if op == '==': return left == right
        if op == '!=': return left != right
        if op in ('&&', 'and', '&'): return bool(left) and bool(right)
        if op in ('||', 'or', '|'): return bool(left) or bool(right)
        raise EvaluatorError(f"Unknown operator {op}")

    async def eval_FunctionCallNode(self, node: FunctionCallNode, env: Environment):
        name = node.name
        if hasattr(node, 'args') and node.args:
            if len(node.args) == 1:
                current = await self.eval(node.args[0], env)
            else:
                arg_vals = []
                for a in node.args:
                    arg_vals.append(await self.eval(a, env))
                current = arg_vals
        else:
            current = env.get_current()
        
        # 1. User-defined functions
        func_def = env.get_function(name)
        if func_def:
            new_env = Environment(parent=env.parent or env) # Scope issue was here, fixed below
            new_env = Environment(parent=env) # Proper lexical scoping
            if len(func_def.params) == 1:
                new_env.set_var(func_def.params[0].name, current)
            elif len(func_def.params) > 1 and isinstance(current, list):
                for i, param in enumerate(func_def.params):
                    if i < len(current):
                        new_env.set_var(param.name, current[i])
            return await self.eval_BlockNode(func_def.block, new_env)
        
        # 2. Built-in functions
        from pop_builtins import BUILTIN_REGISTRY
        if name in BUILTIN_REGISTRY:
            import inspect
            res = BUILTIN_REGISTRY[name](current, env, self)
            if inspect.iscoroutine(res):
                res = await res
            return res
            
        # Fallback for capitalized variables (parsed as FunctionCallNode with no args)
        if not hasattr(node, 'args') or not node.args:
            try:
                return env.get_var(name)
            except Exception:
                pass
                
        raise PopPopError("NameError", f"Function '{name}' is not defined.")

    async def eval_BundleNode(self, node: BundleNode, env: Environment):
        res = []
        for item in node.items:
            item_env = Environment(parent=env)
            item_env.set_current(env.get_current())
            res.append(await self.eval(item, item_env))
        return res

    async def eval_IndexAccessNode(self, node: IndexAccessNode, env: Environment):
        target = await self.eval(node.target, env)
        idx = await self.eval(node.index, env)
        try:
            return target[idx]
        except KeyError:
            return None
        except (IndexError, TypeError) as e:
            raise PopPopError("IndexError", f"Cannot access index/key '{idx}' on {target}: {e}")

    async def eval_BindNode(self, node: BindNode, env: Environment):
        val = env.get_current()
        if isinstance(node.target, IndexAccessNode):
            await self._set_index_target(node.target, val, env)
            return val
        elif isinstance(node.target, VariableNode):
            if node.type_name:
                self._check_type(val, node.type_name)
            env.set_var(node.target.name, val)
            return val
        else:
            raise EvaluatorError(f"Invalid bind target {node.target}")

    async def _set_index_target(self, node: IndexAccessNode, val: Any, env: Environment):
        target = await self.eval(node.target, env)
        idx = await self.eval(node.index, env)
        try:
            target[idx] = val
        except (IndexError, KeyError, TypeError) as e:
            raise PopPopError("IndexError", f"Cannot set index/key '{idx}': {e}")

    async def eval_MustBeNode(self, node: MustBeNode, env: Environment):
        val = env.get_current()
        self._check_type(val, node.type_name)
        return val

    def _check_type(self, val: Any, type_name: str):
        type_map = {
            'int': int,
            'str': str,
            'bool': bool,
            'list': list,
            'dict': dict
        }
        if type_name in type_map:
            if not isinstance(val, type_map[type_name]):
                raise EvaluatorError(f"Type check failed: expected {type_name}, got {type(val).__name__}")
        return True

    async def eval_CheckBlock(self, node: CheckBlock, env: Environment):
        val = env.get_current()
        for branch in node.branches:
            if branch.condition is None: # else branch
                return await self.eval(branch.block, env)
            
            # Evaluate the condition expression
            cond_result = await self.eval(branch.condition, env)
            
            # Smart check: If it's an explicit boolean expression, use its truth value.
            # Otherwise, use implicit equality against the incoming val.
            is_explicit_expr = isinstance(branch.condition, ExpressionNode)
            
            if is_explicit_expr:
                is_match = bool(cond_result)
            else:
                is_match = (val == cond_result)
                if not is_match and isinstance(cond_result, list):
                    try:
                        is_match = val in cond_result
                    except TypeError:
                        pass
                
            if is_match:
                env.set_current(val)
                return await self.eval(branch.block, env)
        return val

    async def eval_LoopBlock(self, node: LoopBlock, env: Environment):
        val = env.get_current()
        while True:
            loop_env = Environment(parent=env)
            loop_env.set_current(val)
            try:
                val = await self.eval(node.block, loop_env)
            except BreakException as e:
                val = e.value
                break
        return val



    async def eval_CatchBlock(self, node: CatchBlock, env: Environment):
        return await self.eval(node.block, env)

    async def eval_JoinNode(self, node: JoinNode, env: Environment):
        val = env.get_current()
        if not isinstance(val, dict):
            return val
            
        if node.mode == 'pack':
            return val
        elif node.mode == 'flat':
            flat_list = []
            for k, v in val.items():
                if isinstance(v, list):
                    flat_list.extend(v)
                else:
                    flat_list.append(v)
            return flat_list

    async def eval_ReturnNode(self, node: ReturnNode, env: Environment):
        val = env.get_current()
        raise ReturnException(val)

    async def eval_DestructuringBindNode(self, node: DestructuringBindNode, env: Environment):
        val = env.get_current()
        if not isinstance(val, list):
            raise EvaluatorError("Destructuring bind requires a list/bundle")
        for i, target in enumerate(node.targets):
            if i < len(val):
                env.set_var(target, val[i])
            else:
                env.set_var(target, None)
        return val

    async def eval_InterpolatedStringNode(self, node: InterpolatedStringNode, env: Environment):
        res = ""
        saved_current = env.get_current()
        for part in node.parts:
            if isinstance(part, str):
                res += part
            else:
                interp_env = Environment(parent=env)
                interp_env.set_current(saved_current)
                res += str(await self.eval(part, interp_env))
        return res

class ReturnException(Exception):
    def __init__(self, value):
        self.value = value
