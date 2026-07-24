from typing import Any, Dict, Optional

class Environment:
    def __init__(self, parent=None):
        self.parent: Optional['Environment'] = parent
        self.variables: Dict[str, Any] = {}
        self.functions: Dict[str, Any] = {} # Can store FunctionDefNode
        self.current_item: Any = None # The '@' variable

    def has_var(self, name: str) -> bool:
        if name in self.variables:
            return True
        if self.parent:
            return self.parent.has_var(name)
        return False

    def set_var(self, name: str, value: Any):
        if name in self.variables:
            self.variables[name] = value
        elif self.parent and self.parent.has_var(name):
            self.parent.set_var(name, value)
        else:
            self.variables[name] = value

    def get_var(self, name: str) -> Any:
        if name in self.variables:
            return self.variables[name]
        if self.parent:
            return self.parent.get_var(name)
        raise NameError(f"Variable '{name}' is not defined.")

    def set_function(self, name: str, func_def: Any):
        self.functions[name] = func_def

    def get_function(self, name: str) -> Any:
        if name in self.functions:
            return self.functions[name]
        if self.parent:
            return self.parent.get_function(name)
        return None # Built-in functions handled separately

    def set_current(self, value: Any):
        self.current_item = value

    def get_current(self) -> Any:
        if self.current_item is not None:
            return self.current_item
        if self.parent:
            return self.parent.get_current()
        return None
