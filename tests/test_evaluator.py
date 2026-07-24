import asyncio
import pytest
from lexer import Lexer
from parser import Parser
from evaluator import Evaluator
from environment import Environment

def run_code(code):
    lexer = Lexer(code)
    tokens = lexer.tokenize()
    parser = Parser(tokens)
    ast = parser.parse()
    env = Environment()
    evaluator = Evaluator()
    asyncio.run(evaluator.eval(ast, env))
    return env.get_current()

def test_evaluator_basic():
    res = run_code("1 >> x. x + 2.")
    assert res == 3

def test_evaluator_builtin_math():
    res = run_code("[1, 2, 3] >> Length.")
    assert res == 3

def test_evaluator_error_pipeline():
    # Should catch error and return fallback
    res = run_code('"abc" >> Int >~> 0.')
    assert res == 0
