import pytest
from lexer import Lexer

def test_lexer_numbers():
    lexer = Lexer("42 3.14")
    tokens = lexer.tokenize()
    assert tokens[0].type == 'NUMBER'
    assert tokens[0].value == 42
    assert tokens[1].type == 'NUMBER'
    assert tokens[1].value == 3.14
