import pytest
from lexer import Lexer
from parser import Parser
from ast_nodes import *

def parse_code(code):
    lexer = Lexer(code)
    tokens = lexer.tokenize()
    parser = Parser(tokens)
    return parser.parse()

def test_parser_pipeline():
    ast = parse_code("1 >> x.")
    assert len(ast.statements) == 1
    pipe = ast.statements[0]
    assert isinstance(pipe, Pipeline)
    assert len(pipe.nodes) == 2
    assert isinstance(pipe.nodes[0], LiteralNode)
    assert pipe.nodes[0].value == 1
    assert isinstance(pipe.nodes[1], BindNode) # x should be bound

def test_parser_single_node_no_bind():
    ast = parse_code("x.")
    pipe = ast.statements[0]
    assert len(pipe.nodes) == 1
    # Should not be coerced to BindNode anymore
    assert isinstance(pipe.nodes[0], VariableNode)

def test_parser_fstring():
    ast = parse_code('$"Hello {name}".')
    pipe = ast.statements[0]
    fstr = pipe.nodes[0]
    assert isinstance(fstr, InterpolatedStringNode)
    assert len(fstr.parts) == 2
