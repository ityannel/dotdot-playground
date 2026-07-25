const SAMPLES = {
    "hello": {
        "name": "00. Hello PopPop!",
        "code": "\"Welcome to the PopPop Playground!\\nSelect a sample from the top right menu to see what this language can do.\" >> Display."
    },
    "basics_01_numbers": {
        "name": "[Basics] 01 Numbers",
        "code": "42 >> Display.\n-100 >> Display.\n3.14 >> Display."
    },
    "basics_02_strings": {
        "name": "[Basics] 02 Strings",
        "code": "\"Hello, PopPop!\" >> Display.\n\"String on line 2\" >> Display."
    },
    "basics_03_lists": {
        "name": "[Basics] 03 Lists",
        "code": "[1, 2, 3] >> arr.\narr >> Display."
    },
    "basics_04_dict": {
        "name": "[Basics] 04 Dict",
        "code": "{\"name\": \"Alice\", \"age\": 30} >> user.\nuser >> Display."
    },
    "basics_05_variable": {
        "name": "[Basics] 05 Variable",
        "code": "42 >> x.\nx >> Display.\n\"Value: \" >+> (x >> Str) >> Display."
    },
    "basics_06_sum": {
        "name": "[Basics] 06 Sum",
        "code": "[1, 2, 3, 4, 5] >> nums.\nnums >> Sum >> total.\ntotal >> Display."
    },
    "basics_07_sort": {
        "name": "[Basics] 07 Sort",
        "code": "[3, 1, 4, 1, 5, 9] >> arr.\narr >> Sort >> sorted.\nsorted >> Display."
    },
    "basics_08_reverse": {
        "name": "[Basics] 08 Reverse",
        "code": "[1, 2, 3] >> arr.\narr >> Reverse >> rev.\nrev >> Display."
    },
    "basics_09_length": {
        "name": "[Basics] 09 Length",
        "code": "[10, 20, 30, 40] >> items.\nitems >> Length >> len.\nlen >> Display."
    },
    "basics_10_max_min": {
        "name": "[Basics] 10 Max Min",
        "code": "[5, 1, 9, 3] >> nums.\nnums >> Max >> max_val.\nnums >> Min >> min_val.\nmax_val >> Display.\nmin_val >> Display."
    },
    "control_01_check": {
        "name": "[Control] 01 Check",
        "code": "42 >> val.\nval >> check:\n    is > 100: \"Large\" >> Display.\n    is > 50: \"Medium\" >> Display.\n    else: \"Small\" >> Display.\n.."
    },
    "control_02_check_string": {
        "name": "[Control] 02 Check String",
        "code": "\"active\" >> status.\nstatus >> check:\n    is \"active\": \"Running\" >> Display.\n    is \"inactive\": \"Stopped\" >> Display.\n    else: \"Unknown\" >> Display.\n.."
    },
    "control_03_catch": {
        "name": "[Control] 03 Catch",
        "code": "\"not a number\" >> Int >> catch:\n    @ >> err.\n    \"Could not convert to int\" >> Display.\n.."
    },
    "control_04_catch_with_default": {
        "name": "[Control] 04 Catch With Default",
        "code": "[1, 2] >> arr.\narr[10] >> catch:\n    @ >> err.\n    -1 >> Return.\n.. >> val.\nval >> Display."
    },
    "map_01_simple": {
        "name": "[Map] 01 Simple",
        "code": "[1, 2, 3] >> Map(n):\n    n * 2 >> Return.\n.. >> doubled.\ndoubled >> Display."
    },
    "map_02_strings": {
        "name": "[Map] 02 Strings",
        "code": "[\"hello\", \"world\"] >> words.\nwords >> Map(w):\n    w >> Uppercase >> Return.\n.. >> upper.\nupper >> Display."
    },
    "map_03_objects": {
        "name": "[Map] 03 Objects",
        "code": "[{\"id\": 1, \"name\": \"Alice\"}, {\"id\": 2, \"name\": \"Bob\"}] >> users.\nusers >> Map(u):\n    (u & \"name\") >> Get >> Return.\n.. >> names.\nnames >> Display."
    },
    "filter_01_simple": {
        "name": "[Filter] 01 Simple",
        "code": "[1, 2, 3, 4, 5] >> nums.\nnums >> Filter(n):\n    n > 2 >> Return.\n.. >> filtered.\nfiltered >> Display."
    },
    "filter_02_even": {
        "name": "[Filter] 02 Even",
        "code": "[1, 2, 3, 4, 5, 6] >> nums.\nnums >> Filter(n):\n    n % 2 == 0 >> Return.\n.. >> evens.\nevens >> Display."
    },
    "filter_03_objects": {
        "name": "[Filter] 03 Objects",
        "code": "[{\"age\": 15}, {\"age\": 25}, {\"age\": 30}] >> people.\npeople >> Filter(p):\n    (p & \"age\") >> Get >> age.\n    age >= 18 >> Return.\n.. >> adults.\nadults >> Display."
    },
    "reduce_01_sum": {
        "name": "[Reduce] 01 Sum",
        "code": "[1, 2, 3, 4, 5] >> nums.\nnums >> Reduce(acc, n):\n    (acc + n) >> Return.\n.. >> sum.\nsum >> Display."
    },
    "reduce_02_product": {
        "name": "[Reduce] 02 Product",
        "code": "[1, 2, 3, 4] >> nums.\nnums >> Reduce(acc, n):\n    (acc * n) >> Return.\n.. >> product.\nproduct >> Display."
    },
    "reduce_03_string_concat": {
        "name": "[Reduce] 03 String Concat",
        "code": "[\"Hello\", \" \", \"PopPop\"] >> parts.\nparts >> Reduce(acc, p):\n    (acc >+> p) >> Return.\n.. >> result.\nresult >> Display."
    },
    "strings_01_split": {
        "name": "[Strings] 01 Split",
        "code": "(\"a,b,c\" & \",\") >> Split >> parts.\nparts >> Display."
    },
    "strings_02_join": {
        "name": "[Strings] 02 Join",
        "code": "([\"hello\", \"world\"] & \" \") >> Join >> sentence.\nsentence >> Display."
    },
    "strings_03_replace": {
        "name": "[Strings] 03 Replace",
        "code": "([\"hello world\" & \"world\" & \"PopPop\"] ) >> Replace >> result.\nresult >> Display."
    },
    "strings_04_case": {
        "name": "[Strings] 04 Case",
        "code": "\"hello\" >> Uppercase >> upper.\n\"WORLD\" >> Lowercase >> lower.\nupper >> Display.\nlower >> Display."
    },
    "dict_01_get": {
        "name": "[Dict] 01 Get",
        "code": "{\"name\": \"Alice\", \"age\": 30} >> user.\n(user & \"name\") >> Get >> name.\nname >> Display."
    },
    "dict_02_set": {
        "name": "[Dict] 02 Set",
        "code": "{} >> user.\n(user & \"name\" & \"Bob\") >> Set >> user2.\n(user2 & \"age\" & 25) >> Set >> user3.\nuser3 >> Display."
    },
    "dict_03_contains": {
        "name": "[Dict] 03 Contains",
        "code": "({\"a\": 1, \"b\": 2} & \"a\") >> Contains >> has_a.\nhas_a >> Display.\n({\"x\": 10} & \"y\") >> Contains >> has_y.\nhas_y >> Display."
    },
    "types_01_int": {
        "name": "[Types] 01 Int",
        "code": "\"42\" >> Int >> num.\nnum >> Display.\n3.14 >> Int >> num2.\nnum2 >> Display."
    },
    "types_02_str": {
        "name": "[Types] 02 Str",
        "code": "42 >> Str >> s.\ns >> Display.\n3.14 >> Str >> s2.\ns2 >> Display."
    },
    "types_03_bool": {
        "name": "[Types] 03 Bool",
        "code": "1 >> Bool >> b1.\n0 >> Bool >> b2.\nb1 >> Display.\nb2 >> Display."
    },
    "types_04_type": {
        "name": "[Types] 04 Type",
        "code": "42 >> Type >> t1.\n\"hello\" >> Type >> t2.\n[1, 2] >> Type >> t3.\nt1 >> Display.\nt2 >> Display.\nt3 >> Display."
    },
    "functions_01_basic": {
        "name": "[Functions] 01 Basic",
        "code": "new Add:\n    @ >> arr.\n    arr[0] >> a.\n    arr[1] >> b.\n    (a + b).\n..\n\n(10 & 20) >> Add >> result.\nresult >> Display."
    },
    "functions_02_with_logic": {
        "name": "[Functions] 02 With Logic",
        "code": "new IsPositive:\n    @ >> check:\n        is > 0: true.\n        else: false.\n    ..\n..\n\n42 >> IsPositive >> result.\nresult >> Display.\n-5 >> IsPositive >> result2.\nresult2 >> Display."
    },
    "functions_03_with_map": {
        "name": "[Functions] 03 With Map",
        "code": "new Double:\n    @ >> num.\n    num * 2.\n..\n\n[1, 2, 3] >> Map(n):\n    n >> Double >> Return.\n.. >> result.\nresult >> Display."
    },
    "json_01_parse": {
        "name": "[Json] 01 Parse",
        "code": "\"{\\\"name\\\": \\\"Alice\\\", \\\"age\\\": 30}\" >> json_str.\njson_str >> FromJson >> obj.\nobj >> Display."
    },
    "json_02_stringify": {
        "name": "[Json] 02 Stringify",
        "code": "{\"name\": \"Bob\", \"age\": 25} >> obj.\nobj >> ToJson >> json_str.\njson_str >> Display."
    },
    "json_03_array": {
        "name": "[Json] 03 Array",
        "code": "\"[1, 2, 3]\" >> json_str.\njson_str >> FromJson >> arr.\narr >> Display."
    },
    "advanced_01_nested": {
        "name": "[Advanced] 01 Nested",
        "code": "[{\"user\": {\"name\": \"Alice\"}}, {\"user\": {\"name\": \"Bob\"}}] >> users.\nusers >> Map(u):\n    (u & \"user\") >> Get >> user.\n    (user & \"name\") >> Get >> Return.\n.. >> names.\nnames >> Display."
    },
    "advanced_02_pipeline": {
        "name": "[Advanced] 02 Pipeline",
        "code": "[5, 3, 8, 1, 9] >> nums.\nnums >> Sort >> s.\ns >> Reverse >> r.\nr >> Display."
    },
    "advanced_03_check_map": {
        "name": "[Advanced] 03 Check Map",
        "code": "[1, 2, 3, 4, 5] >> nums.\nnums >> Map(n):\n    n >> check:\n        is > 3: (\"Large: \" >+> (n >> Str)) >> Return.\n        else: (\"Small: \" >+> (n >> Str)) >> Return.\n    ..\n.. >> labeled.\nlabeled >> Display."
    },
    "advanced_04_error_recovery": {
        "name": "[Advanced] 04 Error Recovery",
        "code": "[\"10\", \"not_a_number\", \"20\"] >> strs.\nstrs >> Map(s):\n    s >> Int >> catch:\n        @ >> err.\n        0 >> Return.\n    .. >> Return.\n.. >> nums.\nnums >> Display."
    }
};
