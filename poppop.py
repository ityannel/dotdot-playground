import sys
import asyncio
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))
import json
from lexer import Lexer, LexerError
from parser import Parser, ParseError
from evaluator import Evaluator, PopPopError, EvaluatorError

def get_ast_json(code: str) -> str:
    try:
        lexer = Lexer(code)
        tokens = lexer.tokenize()
        parser = Parser(tokens)
        ast = parser.parse()
        return json.dumps(ast.to_dict())
    except Exception as e:
        return json.dumps({"error": str(e)})

async def run_code(code: str):
    try:
        lexer = Lexer(code)
        tokens = lexer.tokenize()
        
        parser = Parser(tokens)
        ast = parser.parse()
        
        evaluator = Evaluator()
        result = await evaluator.eval(ast, evaluator.global_env)
        return result
    except LexerError as e:
        print(f"[SyntaxError] {e}")
    except ParseError as e:
        print(f"[SyntaxError] {e}")
    except PopPopError as e:
        print(f"[{e.err_type}] {e.message}")
    except EvaluatorError as e:
        print(f"[RuntimeError] {e}")
    except Exception as e:
        print(f"[SystemError] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()

async def repl():
    print("PopPop REPL (v1.0)")
    print("Type 'exit' to quit.")
    
    code_buffer = ""
    evaluator = Evaluator()
    
    while True:
        try:
            line = input(".. " if not code_buffer else "   ")
        except EOFError:
            break
            
        if line.strip() == 'exit':
            break
            
        code_buffer += line + "\n"
        
        # In a real REPL, we'd check if the statement is complete
        # For simplicity, if it ends with '.', we evaluate
        if line.strip().endswith('.') or line.strip() == 'end.':
            try:
                lexer = Lexer(code_buffer)
                tokens = lexer.tokenize()
                parser = Parser(tokens)
                ast = parser.parse()
                await evaluator.eval(ast, evaluator.global_env)
            except LexerError as e:
                print(f"[SyntaxError] {e}")
            except ParseError as e:
                print(f"[SyntaxError] {e}")
            except PopPopError as e:
                print(f"[{e.err_type}] {e.message}")
            except EvaluatorError as e:
                print(f"[RuntimeError] {e}")
            except Exception as e:
                print(f"[SystemError] An unexpected error occurred: {e}")
            code_buffer = ""

if __name__ == '__main__':
    if len(sys.argv) > 1:
        with open(sys.argv[1], 'r', encoding='utf-8') as f:
            code_text = f.read()
        asyncio.run(run_code(code_text))
    else:
        asyncio.run(repl())