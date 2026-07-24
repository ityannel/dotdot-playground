import os

scripts = {
'log2.pop': '''[
    "INFO: User created",
    "DEBUG: Cache miss",
    "INFO: User deleted",
    "ERROR: Null pointer",
    "WARNING: Disk full",
    "INFO: Logout"
] >> logs.

new ExtractLevel:
    (@ & ":") >> Split >> parts.
    parts[0] >> Return.
..

logs >> Map @log:
    log >> ExtractLevel.
.. >> levels.

{} >> counts.
levels >!> @level:
    (counts & level) >> Get >> catch:
        @ >> err.
        0
    .. >> current_count.
    
    (current_count + 1) >> new_count.
    (counts & level & new_count) >> Set >> counts.
..

"Log level counts:" >> Display.
counts >> ToJson >> Display.
''',
'log3.pop': '''[
    "MSG: short",
    "MSG: a slightly longer message",
    "MSG: the longest message in the log file"
] >> logs.

new GetMsg:
    (@ & ": ") >> Split >> parts.
    parts[1] >> Return.
..

logs >> Map @log:
    log >> GetMsg.
.. >> messages.

messages >> Reduce @arr:
    arr[0] >> a.
    arr[1] >> b.
    a >> Length >> len_a.
    b >> Length >> len_b.
    len_a >> check:
        is > len_b:
            a.
        else:
            b.
    ..
.. >> longest.

"Longest message:" >> Display.
longest >> Display.
''',
'log4.pop': '''"ERROR: disk full\\nWARNING: cpu high\\nINFO: ok\\nERROR: timeout" >> raw_data.
(raw_data & "\\n") >> Split >> logs.

new IsError:
    (@ & "ERROR") >> Contains >> Return.
..
new IsWarn:
    (@ & "WARNING") >> Contains >> Return.
..

logs >> Filter @log:
    log >> IsError.
.. >> errors.

logs >> Filter @log:
    log >> IsWarn.
.. >> warns.

"Errors found: " >> Display. 
errors >> Display.
"Warnings found: " >> Display. 
warns >> Display.
''',
'log7.pop': '''[
    "id,level,msg",
    "1,INFO,Started",
    "2,ERROR,Failed to load",
    "3,DEBUG,Loading config"
] >> csv_lines.

(csv_lines & 1 & 4) >> Slice >> data_lines.

new ParseCSV:
    (@ & ",") >> Split >> parts.
    {} >> my_dict.
    (my_dict & "id" & parts[0]) >> Set >> my_dict.
    (my_dict & "level" & parts[1]) >> Set >> my_dict.
    (my_dict & "msg" & parts[2]) >> Set >> my_dict.
    my_dict >> Return.
..

data_lines >> Map @line:
    line >> ParseCSV.
.. >> parsed_logs.

"Parsed Log Objects:" >> Display.
parsed_logs >> ToJson >> Display.
''',
'log10.pop': '''[
    "INFO|Success",
    "ERROR|Failed",
    "MALFORMED_LOG_WITHOUT_PIPE"
] >> logs.

new ParseLog:
    @ >> msg.
    (msg & "|") >> Contains >> check:
        is false:
            ("Simulated error" & "div") >> Split >> dummy.
            dummy[10] >> dummy2.
        else:
            (msg & "|") >> Split >> parts.
            parts[1].
    ..
..

"Processing logs with error handling:" >> Display.
logs >!> @log:
    log >> ParseLog >> catch:
        @ >> err.
        "Failed to parse log: " >+> log >> Display.
        "Error info: " >+> err["message"] >> Display.
        "null"
    .. >> result.
    result >> Display.
..
'''
}

for name, code in scripts.items():
    with open(f'samples/agent_4_log_parser/{name}', 'w', encoding='utf-8') as f:
        f.write(code)
