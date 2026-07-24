const SAMPLES = {
    "hello": {
        "name": "00. Hello PopPop!",
        "code": "\"Welcome to the PopPop Playground!\\nSelect a sample from the top right menu to see what this language can do.\" >> Display."
    },
    "agent_10_todo_add_task": {
        "name": "[Todo] Add Task",
        "code": "// add_task.pop\n// Demonstrates adding tasks to a list using >+> and map\n\n(int id & str title) >> new CreateTask:\n    {\"id\": id, \"title\": title, \"done\": false}.\n..\n\n[] >> tasks.\n(1 & \"Buy Milk\") >> CreateTask >+> tasks.\n(2 & \"Read Book\") >> CreateTask >+> tasks.\n(3 & \"Write Code\") >> CreateTask >+> tasks.\n\n\"--- Initial Tasks ---\" >> Display.\ntasks >> Map @t:\n    \"Task: \" >+> @t[\"title\"] >> Display.\n..\n\n\"Total tasks: \" >+> (tasks >> Length >> Str) >> Display.\n"
    },
    "agent_10_todo_count_completed": {
        "name": "[Todo] Count Completed",
        "code": "// count_completed.pop\n// Demonstrates using Map and Reduce to count completed tasks\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Buy Milk\", \"done\": true} >+> tasks.\n{\"id\": 2, \"title\": \"Read Book\", \"done\": false} >+> tasks.\n{\"id\": 3, \"title\": \"Write Code\", \"done\": true} >+> tasks.\n{\"id\": 4, \"title\": \"Cook Dinner\", \"done\": true} >+> tasks.\n\ntasks >> Map:\n    @[\"done\"] >> check:\n        is true: 1.\n        else: 0.\n    ..\n.. >> counts.\n\ncounts >> Reduce @acc @item:\n    (@acc & @item) >> Add.\n.. >> total_completed.\n\n\"Total completed tasks: \" >> Display.\ntotal_completed >> Display.\n"
    },
    "agent_10_todo_due_date_check": {
        "name": "[Todo] Due Date Check",
        "code": "// due_date_check.pop\n// Combines Filter and Map for due date logic\n\n[] >> tasks.\n{\"title\": \"Pay bills\", \"due\": 20260720} >+> tasks.\n{\"title\": \"Buy groceries\", \"due\": 20260725} >+> tasks.\n{\"title\": \"Renew license\", \"due\": 20260718} >+> tasks.\n\n20260722 >> current_date.\n\n// Filter overdue tasks\ntasks >> Filter:\n    @[\"due\"] < current_date.\n.. >> overdue_tasks.\n\n\"--- Overdue Tasks ---\" >> Display.\noverdue_tasks >> Display.\n\n// Map to add warning\noverdue_tasks >> Map:\n    (@ & \"warning\" & \"OVERDUE!\") >> Set.\n.. >> warned_tasks.\n\n\"--- Warned Tasks ---\" >> Display.\nwarned_tasks >> Display.\n"
    },
    "agent_10_todo_list_pending": {
        "name": "[Todo] List Pending",
        "code": "// list_pending.pop\n// Demonstrates filtering to show only pending tasks\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Buy Milk\", \"done\": true} >+> tasks.\n{\"id\": 2, \"title\": \"Read Book\", \"done\": false} >+> tasks.\n{\"id\": 3, \"title\": \"Write Code\", \"done\": true} >+> tasks.\n{\"id\": 4, \"title\": \"Walk Dog\", \"done\": false} >+> tasks.\n\n\"--- All Tasks ---\" >> Display.\ntasks >> Display.\n\ntasks >> Filter:\n    @[\"done\"] >> check:\n        is false: true.\n        else: false.\n    ..\n.. >> pending_tasks.\n\n\"--- Pending Tasks ---\" >> Display.\npending_tasks >> Display.\n"
    },
    "agent_10_todo_mark_done": {
        "name": "[Todo] Mark Done",
        "code": "// mark_done.pop\n// Demonstrates using Map to modify a task's status\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Buy Milk\", \"done\": false} >+> tasks.\n{\"id\": 2, \"title\": \"Read Book\", \"done\": false} >+> tasks.\n{\"id\": 3, \"title\": \"Write Code\", \"done\": false} >+> tasks.\n\n\"--- Before Marking Done ---\" >> Display.\ntasks >> Display.\n\n// Mark task with ID 2 as done\ntasks >> Map:\n    @ >> t.\n    t[\"id\"] >> check:\n        is 2: \n            (t & \"done\" & true) >> Set.\n        else: \n            t.\n    ..\n.. >> updated_tasks.\n\n\"--- After Marking Done ---\" >> Display.\nupdated_tasks >> Display.\n"
    },
    "agent_10_todo_remove_task": {
        "name": "[Todo] Remove Task",
        "code": "// remove_task.pop\n// Demonstrates removing a task using filter\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Buy Milk\", \"done\": false} >+> tasks.\n{\"id\": 2, \"title\": \"Read Book\", \"done\": false} >+> tasks.\n{\"id\": 3, \"title\": \"Write Code\", \"done\": false} >+> tasks.\n\n\"--- Before Removal ---\" >> Display.\ntasks >> Display.\n\ntasks >> Filter:\n    @[\"id\"] >> check:\n        is 2: false.\n        else: true.\n    ..\n.. >> filtered_tasks.\n\n\"--- After Removal ---\" >> Display.\nfiltered_tasks >> Display.\n"
    },
    "agent_10_todo_save_load_tasks": {
        "name": "[Todo] Save Load Tasks",
        "code": "// save_load_tasks.pop\n// Demonstrates Fork to simulate save and Catch to handle load error\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Save the world\", \"done\": false} >+> tasks.\n\ntasks >> Fork:\n    (@ >> ToJson & \"tasks_db.json\") >> WriteFile.\n    @ >> Display.\n..\n\n\"--- Loading Tasks ---\" >> Display.\n\n\"tasks_db.json\" >> Fetch >> FromJson >> loaded.\n\"Loaded: \" >> Display.\nloaded >> Display.\n\n\"--- Testing Error Catch ---\" >> Display.\n\"missing_db.json\" >> Fetch >> catch:\n    @ >> err.\n    \"Failed to load missing_db.json!\" >> Display.\n    \"Reason: \" + err[\"message\"] >> Display.\n    [].\n.. >> fallback_tasks.\n\n\"Fallback tasks: \" >> Display.\nfallback_tasks >> Display.\n"
    },
    "agent_10_todo_search_tasks": {
        "name": "[Todo] Search Tasks",
        "code": "// search_tasks.pop\n// Filter tasks containing a keyword using Contains\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Buy Milk\"} >+> tasks.\n{\"id\": 2, \"title\": \"Read a Book\"} >+> tasks.\n{\"id\": 3, \"title\": \"Buy a new laptop\"} >+> tasks.\n\n\"Buy\" >> keyword.\n\n\"Searching for: \" + keyword >> Display.\n\ntasks >> Filter:\n    (@[\"title\"] & keyword) >> Contains.\n.. >> search_results.\n\n\"--- Search Results ---\" >> Display.\nsearch_results >> Display.\n"
    },
    "agent_10_todo_task_priority": {
        "name": "[Todo] Task Priority",
        "code": "// task_priority.pop\n// Demonstrates check block to assign priorities based on due days\n\n[] >> tasks.\n{\"id\": 1, \"title\": \"Buy Milk\", \"days_left\": 1} >+> tasks.\n{\"id\": 2, \"title\": \"Read Book\", \"days_left\": 5} >+> tasks.\n{\"id\": 3, \"title\": \"Write Code\", \"days_left\": -1} >+> tasks.\n\ntasks >> Map @t:\n    @t[\"days_left\"] >> check:\n        is < 0:\n            (@t & \"priority\" & \"URGENT\") >> Set.\n        is <= 2:\n            (@t & \"priority\" & \"HIGH\") >> Set.\n        else:\n            (@t & \"priority\" & \"NORMAL\") >> Set.\n    ..\n.. >> prioritized_tasks.\n\n\"--- Tasks with Priority ---\" >> Display.\nprioritized_tasks >> Display.\n"
    },
    "agent_10_todo_task_summary_report": {
        "name": "[Todo] Task Summary Report",
        "code": "// task_summary_report.pop\n// Pipeline combining filter, reduce, and map to generate a summary string\n\n[] >> tasks.\n{\"title\": \"Buy Milk\", \"done\": true} >+> tasks.\n{\"title\": \"Read Book\", \"done\": false} >+> tasks.\n{\"title\": \"Write Code\", \"done\": true} >+> tasks.\n\ntasks >> Filter:\n    @[\"done\"] >> check:\n        is true: true.\n        else: false.\n    ..\n.. >> completed_tasks.\n\ncompleted_tasks >> Map:\n    \"- \" + @[\"title\"] + \"\\n\".\n.. >> task_lines.\n\n\"Completed Tasks:\\n\" >> report.\n\ntask_lines >> Reduce @acc @item:\n    @acc + @item.\n.. >> report_content.\n\nreport + report_content >> final_report.\n\n\"--- Final Report ---\" >> Display.\nfinal_report >> Display.\n"
    },
    "agent_11_errors_01_div_zero_recovery": {
        "name": "[Errors] 01 Div Zero Recovery",
        "code": "new SafeDivide:\n    @ >> arr.\n    (arr[0] / arr[1]).\n..\n\nnew Process:\n    @ >> num.\n    (100 & num) >> SafeDivide >> catch:\n        @ >> err.\n        \"Recovered from zero division\" >> Display.\n        -1 >> Return.\n    ..\n..\n\n[10, 5, 0, 2, 0, 1] >> Map:\n    @ >> Process >> Return.\n.. >> results.\n\n\"Results with default fallback:\" >> Display.\nresults >> Display.\n"
    },
    "agent_11_errors_02_type_mismatch": {
        "name": "[Errors] 02 Type Mismatch",
        "code": "new StrictAdd:\n    @ >> arr.\n    arr[0] >> int a.\n    arr[1] >> int b.\n    (a + b).\n..\n\nnew SafeAdd:\n    @ >> val.\n    (10 & val) >> StrictAdd >> catch:\n        @ >> err.\n        \"Caught Type Mismatch\" >> Display.\n        10 >> Return.\n    ..\n..\n\n[5, \"apple\", 20, \"banana\"] >> Map:\n    @ >> SafeAdd >> Return.\n.. >> results.\n\n\"Failsafes applied:\" >> Display.\nresults >> Display.\n"
    },
    "agent_11_errors_03_api_fetch_mock": {
        "name": "[Errors] 03 Api Fetch Mock",
        "code": "new MockProcess:\n    @ >> data.\n    data >> check:\n        is \"bad\":\n            (1 / 0) >> trigger.\n        else:\n            \"success\".\n    ..\n..\n\nnew SafeProcess:\n    @ >> data.\n    data >> MockProcess >> catch:\n        @ >> err.\n        \"Failed, returning default\" >> Display.\n        \"default\" >> Return.\n    ..\n..\n\n[\"good\", \"bad\", \"okay\"] >> Map:\n    @ >> SafeProcess >> Return.\n.. >> out.\n\n\"Outputs:\" >> Display.\nout >> Display.\n"
    },
    "agent_11_errors_04_dict_missing_key": {
        "name": "[Errors] 04 Dict Missing Key",
        "code": "new ProcessUser:\n    @ >> user.\n    user[\"age\"] >> age.\n    (age + 10).\n..\n\nnew SafeUserProcess:\n    @ >> user.\n    user >> ProcessUser >> catch:\n        @ >> err.\n        \"Missing age key! Using default age 10.\" >> Display.\n        10 >> Return.\n    ..\n..\n\n[{\"name\": \"Alice\", \"age\": 20}, {\"name\": \"Bob\"}] >> Map:\n    @ >> SafeUserProcess >> Return.\n.. >> ages.\n\n\"Ages + 10:\" >> Display.\nages >> Display.\n"
    },
    "agent_11_errors_05_chained_fallbacks": {
        "name": "[Errors] 05 Chained Fallbacks",
        "code": "new RiskyMath:\n    @ >> val.\n    (100 / val) >> num.\n    (num & 10) >> Add.\n..\n\nnew SafePipeline:\n    @ >> val.\n    val >> RiskyMath >> catch:\n        @ >> err.\n        -999 >> Return.\n    ..\n..\n\n[10, 0, 5, 0] >> Map:\n    @ >> SafePipeline >> Return.\n.. >> output.\n\n\"Chained results:\" >> Display.\noutput >> Display.\n"
    },
    "agent_11_errors_06_nested_catch": {
        "name": "[Errors] 06 Nested Catch",
        "code": "new InnerFault:\n    (1 / 0).\n..\n\nnew MiddleProcess:\n    null >> InnerFault >> catch:\n        @ >> err.\n        \"Inner caught error\" >> Display.\n        (\"a\" & 1) >> Add >> dummy. \n    ..\n..\n\nnew OuterProcess:\n    null >> MiddleProcess >> catch:\n        @ >> err.\n        \"Outer caught error, recovering safely\" >> Display.\n        \"Safe final value\" >> Return.\n    ..\n..\n\n[null] >> Map:\n    @ >> OuterProcess >> Return.\n.. >> res.\n\n\"Final result:\" >> Display.\nres[0] >> Display.\n"
    },
    "agent_11_errors_07_type_validation_fail": {
        "name": "[Errors] 07 Type Validation Fail",
        "code": "new ExpectInt:\n    @ >> int val.\n    (val * 2).\n..\n\nnew TryProcess:\n    @ >> v.\n    v >> ExpectInt >> catch:\n        @ >> err.\n        \"Type validation failed. Returning 0.\" >> Display.\n        0 >> Return.\n    ..\n..\n\n[10, \"string\", 20, false] >> Map:\n    @ >> TryProcess >> Return.\n.. >> res.\n\n\"Validated results:\" >> Display.\nres >> Display.\n"
    },
    "agent_11_errors_08_safe_json_parse": {
        "name": "[Errors] 08 Safe Json Parse",
        "code": "new TryParse:\n    @ >> text.\n    text >> FromJson >> catch:\n        @ >> err.\n        \"Malformed JSON, fallback to empty dict\" >> Display.\n        {} >> Return.\n    ..\n..\n\n[\"{\\\"key\\\": 1}\", \"bad json\"] >> Map:\n    @ >> TryParse >> Return.\n.. >> res.\n\n\"Parsed objects:\" >> Display.\nres >> Display.\n"
    },
    "agent_11_errors_09_file_read_fallback": {
        "name": "[Errors] 09 File Read Fallback",
        "code": "new SafeRead:\n    @ >> path.\n    path >> ReadFile >> catch:\n        @ >> err.\n        \"File not found: \" >+> path >> Display.\n        \"default_content\" >> Return.\n    ..\n..\n\n[\"valid_dummy.txt\", \"missing_file.txt\"] >> Map:\n    @ >> SafeRead >> Return.\n.. >> res.\n\n\"Read results:\" >> Display.\nres >> Display.\n"
    },
    "agent_11_errors_10_complex_recovery_pipeline": {
        "name": "[Errors] 10 Complex Recovery Pipeline",
        "code": "new CalculateScore:\n    @ >> data.\n    data[\"kills\"] >> kills.\n    data[\"deaths\"] >> deaths.\n    (kills / deaths).\n..\n\nnew SafeScore:\n    @ >> player.\n    player >> CalculateScore >> catch:\n        @ >> err.\n        \"Error in calculating score, returning 0\" >> Display.\n        0 >> Return.\n    ..\n..\n\n[{\"kills\": 10, \"deaths\": 2}, {\"kills\": 5, \"deaths\": 0}, {\"kills\": 20, \"deaths\": 5}] >> Map:\n    @ >> SafeScore >> Return.\n.. >> scores.\n\n\"Player scores:\" >> Display.\nscores >> Display.\n"
    },
    "agent_12_fork_01_basic_fork": {
        "name": "[Fork] 01 Basic Fork",
        "code": "new ProcessA:\n    (\"Branch A processed: {}\" & @) >> Format >> Display.\n..\n\nnew ProcessB:\n    (\"Branch B processed: {}\" & @) >> Format >> Display.\n..\n\n\"Initial Data Payload\" >> Fork:\n    @ >> ProcessA.\n    @ >> ProcessB.\n    (\"Branch C (inline) processed: {}\" & @) >> Format >> Display.\n..\n\n\"Done Forking!\" >> Display.\n"
    },
    "agent_12_fork_02_image_processing_fork": {
        "name": "[Fork] 02 Image Processing Fork",
        "code": "new ApplyGrayscale:\n    @ >> img.\n    \"Applying grayscale to image...\" >> Display.\n    (img & \"color\" & \"gray\") >> Replace >> result.\n    (\"Grayscale filter done: {}\" & result) >> Format >> Display.\n..\n\nnew ApplyBlur:\n    @ >> img.\n    \"Applying blur filter...\" >> Display.\n    (img & \"sharp\" & \"blurred\") >> Replace >> result.\n    (\"Blur filter done: {}\" & result) >> Format >> Display.\n..\n\nnew ApplyEdgeDetection:\n    @ >> img.\n    \"Running edge detection...\" >> Display.\n    (\"Edge map for {} generated.\" & img) >> Format >> Display.\n..\n\n\"image_data_color_sharp.png\" >> img_src.\n\nimg_src >> Fork:\n    @ >> ApplyGrayscale.\n    @ >> ApplyBlur.\n    @ >> ApplyEdgeDetection.\n..\n\n\"Image processing fork complete.\" >> Display.\n"
    },
    "agent_12_fork_03_log_distribution": {
        "name": "[Fork] 03 Log Distribution",
        "code": "new WriteToConsole:\n    @ >> msg.\n    (\"[CONSOLE] {}\" & msg) >> Format >> Display.\n..\n\nnew SendToServer:\n    @ >> msg.\n    (\"[NETWORK] Sending to server: {}\" & msg) >> Format >> Display.\n..\n\nnew ArchiveToFile:\n    @ >> msg.\n    (\"[FILE] Archiving: {}\" & msg) >> Format >> Display.\n..\n\nnew ProcessLog:\n    @ >> log_entry.\n    log_entry >> Fork:\n        @ >> WriteToConsole.\n        @ >> SendToServer.\n        @ >> ArchiveToFile.\n    .. >> result.\n    result >> Return.\n..\n\n[\"ERROR: DB Connection Lost\", \"INFO: User login\", \"WARN: High memory usage\"] >> logs.\n\nlogs >> Map:\n    @ >> ProcessLog.\n.. >> dummy.\n\n\"Log distribution complete.\" >> Display.\n"
    },
    "agent_12_fork_04_order_processor": {
        "name": "[Fork] 04 Order Processor",
        "code": "new EmailCustomer:\n    (@ & \"email\") >> Get >> email.\n    (\"Sending order confirmation email to {}\" & email) >> Format >> Display.\n..\n\nnew NotifyShipping:\n    (@ & \"item\") >> Get >> item.\n    (\"Notifying warehouse to pack: {}\" & item) >> Format >> Display.\n..\n\nnew UpdateInventory:\n    (@ & \"item\") >> Get >> item.\n    (\"Decreasing inventory count for {}\" & item) >> Format >> Display.\n..\n\n{\"order_id\": 9921, \"email\": \"buyer@example.com\", \"item\": \"Wireless Mouse\"} >> order.\n\norder >> Fork:\n    @ >> EmailCustomer.\n    @ >> NotifyShipping.\n    @ >> UpdateInventory.\n..\n\n\"Order processing parallel paths started successfully.\" >> Display.\n"
    },
    "agent_12_fork_05_sensor_data_fork": {
        "name": "[Fork] 05 Sensor Data Fork",
        "code": "new BackupData:\n    @ >> data.\n    data >> ToJson >> json_data.\n    (\"Backing up sensor data: {}\" & json_data) >> Format >> Display.\n..\n\nnew CheckTemp:\n    @ >> data.\n    (data & \"temp\") >> Get >> temp.\n    temp >> check:\n        is > 40: \"ALERT: High temperature detected!\" >> Display.\n        else: \"Temperature is normal.\" >> Display.\n    ..\n..\n\nnew CheckHumidity:\n    @ >> data.\n    (data & \"humidity\") >> Get >> hum.\n    hum >> check:\n        is > 80: \"ALERT: High humidity detected!\" >> Display.\n        else: \"Humidity is normal.\" >> Display.\n    ..\n..\n\n[\n    {\"id\": \"1\", \"temp\": 35, \"humidity\": 60},\n    {\"id\": \"2\", \"temp\": 45, \"humidity\": 85},\n    {\"id\": \"3\", \"temp\": 20, \"humidity\": 90}\n] >> sensor_readings.\n\nsensor_readings >> Map:\n    @ >> reading.\n    (reading & \"id\") >> Get >> sid.\n    (\"--- Processing Sensor ID {} ---\" & sid) >> Format >> Display.\n    reading >> Fork:\n        @ >> BackupData.\n        @ >> CheckTemp.\n        @ >> CheckHumidity.\n    ..\n.. >> dummy.\n\n\"All sensor data processed.\" >> Display.\n"
    },
    "agent_12_fork_06_notification_system": {
        "name": "[Fork] 06 Notification System",
        "code": "new SendPushNotification:\n    @ >> payload.\n    (payload & \"push_enabled\") >> Get >> enabled.\n    enabled >> check:\n        is true:\n            (payload & \"msg\") >> Get >> msg.\n            (\"PUSH: Sent '{}' to mobile device.\" & msg) >> Format >> Display.\n        else:\n            \"PUSH: User disabled push notifications.\" >> Display.\n    ..\n..\n\nnew SendEmail:\n    @ >> payload.\n    (payload & \"msg\") >> Get >> msg.\n    (\"EMAIL: Sent '{}' to user email address.\" & msg) >> Format >> Display.\n..\n\nnew LogNotificationEvent:\n    @ >> payload.\n    payload >> ToJson >> json_payload.\n    (\"LOG: Notification event recorded: {}\" & json_payload) >> Format >> Display.\n..\n\nnew DispatchNotification:\n    @ >> payload.\n    \"--- Dispatching Notification ---\" >> Display.\n    payload >> Fork:\n        @ >> SendPushNotification.\n        @ >> SendEmail.\n        @ >> LogNotificationEvent.\n    ..\n..\n\n[\n    {\"msg\": \"Your password was changed.\", \"push_enabled\": true},\n    {\"msg\": \"Weekly newsletter is here!\", \"push_enabled\": false}\n] >> notifications.\n\nnotifications >> Map:\n    @ >> DispatchNotification.\n.. >> dummy.\n\n\"All notifications dispatched.\" >> Display.\n"
    },
    "agent_12_fork_07_financial_transaction": {
        "name": "[Fork] 07 Financial Transaction",
        "code": "new ValidateFraud:\n    @ >> tx.\n    (tx & \"amount\") >> Get >> amt.\n    amt >> check:\n        is > 10000:\n            \"FRAUD ALERT: Transaction amount exceeds limits!\" >> Display.\n        else:\n            \"Fraud check passed.\" >> Display.\n    ..\n..\n\nnew ProcessPayment:\n    @ >> tx.\n    (tx & \"amount\") >> Get >> amt.\n    (tx & \"currency\") >> Get >> cur.\n    (\"PAYMENT: Processing {} {}...\" & amt & cur) >> Format >> Display.\n..\n\nnew UpdateLedger:\n    @ >> tx.\n    (tx & \"id\") >> Get >> tid.\n    (\"LEDGER: Transaction {} added to general ledger.\" & tid) >> Format >> Display.\n..\n\nnew HandleTransaction:\n    @ >> tx.\n    (tx & \"id\") >> Get >> tid.\n    (\"--- Handling Transaction {} ---\" & tid) >> Format >> Display.\n    tx >> Fork:\n        @ >> ValidateFraud.\n        @ >> ProcessPayment.\n        @ >> UpdateLedger.\n    ..\n..\n\n[\n    {\"id\": \"TX9901\", \"amount\": 250, \"currency\": \"USD\"},\n    {\"id\": \"TX9902\", \"amount\": 15000, \"currency\": \"EUR\"},\n    {\"id\": \"TX9903\", \"amount\": 15, \"currency\": \"JPY\"}\n] >> transactions.\n\ntransactions >> Map:\n    @ >> HandleTransaction.\n.. >> dummy.\n\n\"Financial transactions processed.\" >> Display.\n"
    },
    "agent_12_fork_08_game_event_dispatcher": {
        "name": "[Fork] 08 Game Event Dispatcher",
        "code": "new UpdatePlayerHealth:\n    @ >> event.\n    (event & \"damage\") >> Get >> damage.\n    (\"PLAYER: Took {} damage!\" & damage) >> Format >> Display.\n..\n\nnew PlaySoundEffect:\n    @ >> event.\n    (event & \"sound\") >> Get >> sound.\n    (\"AUDIO: Playing sound '{}'...\" & sound) >> Format >> Display.\n..\n\nnew SpawnParticles:\n    @ >> event.\n    (event & \"effect\") >> Get >> fx.\n    (\"VFX: Spawning {} particles at impact location.\" & fx) >> Format >> Display.\n..\n\nnew DispatchGameEvent:\n    @ >> event.\n    (event & \"name\") >> Get >> name.\n    (\"--- Event: {} ---\" & name) >> Format >> Display.\n    event >> Fork:\n        @ >> UpdatePlayerHealth.\n        @ >> PlaySoundEffect.\n        @ >> SpawnParticles.\n    ..\n..\n\n[\n    {\"name\": \"Explosion\", \"damage\": 50, \"sound\": \"boom.wav\", \"effect\": \"fire_sparks\"},\n    {\"name\": \"Poison Arrow\", \"damage\": 15, \"sound\": \"thwack.wav\", \"effect\": \"green_mist\"}\n] >> game_events.\n\ngame_events >> Map:\n    @ >> DispatchGameEvent.\n.. >> dummy.\n\n\"Game events dispatched.\" >> Display.\n"
    },
    "agent_12_fork_09_data_sync_fork": {
        "name": "[Fork] 09 Data Sync Fork",
        "code": "new SyncPrimary:\n    @ >> user.\n    (user & \"username\") >> Get >> uname.\n    (\"DB_PRIMARY: Inserted user '{}'.\" & uname) >> Format >> Display.\n..\n\nnew SyncSearchIndex:\n    @ >> user.\n    (user & \"username\") >> Get >> uname.\n    (\"SEARCH_INDEX: Added '{}' for fast searching.\" & uname) >> Format >> Display.\n..\n\nnew SyncAnalytics:\n    @ >> user.\n    (user & \"age\") >> Get >> age.\n    (\"ANALYTICS: Recorded new user registration (Age: {}).\" & age) >> Format >> Display.\n..\n\nnew ProcessUserSync:\n    @ >> user.\n    (user & \"username\") >> Get >> uname.\n    (\"--- Syncing User {} ---\" & uname) >> Format >> Display.\n    user >> Fork:\n        @ >> SyncPrimary.\n        @ >> SyncSearchIndex.\n        @ >> SyncAnalytics.\n    ..\n..\n\n[\n    {\"username\": \"alice99\", \"age\": 28},\n    {\"username\": \"bob_builder\", \"age\": 45},\n    {\"username\": \"charlie_z\", \"age\": 19}\n] >> new_users.\n\nnew_users >> Map:\n    @ >> ProcessUserSync.\n.. >> dummy.\n\n\"All databases synchronized.\" >> Display.\n"
    },
    "agent_12_fork_10_web_request_handler": {
        "name": "[Fork] 10 Web Request Handler",
        "code": "new MiddlewareAuth:\n    @ >> req.\n    (req & \"token\") >> Get >> token.\n    token >> check:\n        is \"valid_token_123\": \"AUTH: Token validated successfully.\" >> Display.\n        else: \"AUTH: Invalid token! Request denied.\" >> Display.\n    ..\n..\n\nnew MiddlewareRateLimit:\n    @ >> req.\n    (req & \"ip\") >> Get >> ip.\n    (\"RATELIMIT: Checking request rate for IP {}...\" & ip) >> Format >> Display.\n..\n\nnew MiddlewareLogger:\n    @ >> req.\n    (req & \"endpoint\") >> Get >> ep.\n    (\"LOGGER: Request received for endpoint '{}'.\" & ep) >> Format >> Display.\n..\n\nnew HandleRequest:\n    @ >> req.\n    \"--- New Incoming Web Request ---\" >> Display.\n    req >> Fork:\n        @ >> MiddlewareAuth.\n        @ >> MiddlewareRateLimit.\n        @ >> MiddlewareLogger.\n    ..\n..\n\n[\n    {\"ip\": \"192.168.1.10\", \"endpoint\": \"/api/users\", \"token\": \"valid_token_123\"},\n    {\"ip\": \"10.0.0.5\", \"endpoint\": \"/api/admin\", \"token\": \"expired_token\"}\n] >> requests.\n\nrequests >> Map:\n    @ >> HandleRequest.\n.. >> dummy.\n\n\"All web requests processed by middleware.\" >> Display.\n"
    },
    "agent_1_data_cleaning_01_filter_nulls": {
        "name": "[Data Cleaning] 01 Filter Nulls",
        "code": "[\"Data1\", null, \"Data2\", null, \"Data3\"] >> raw_data.\n\n\"--- Filtering Nulls ---\" >> Display.\nraw_data >> Filter:\n    @ >> Type >> check:\n        is \"null\": false >> Return.\n    ..\n    true >> Return.\n.. >> clean_data.\n\n\"Original: \" >> out1.\n(raw_data >> ToJson) >+> out1.\nout1 >> Display.\n\n\"Cleaned: \" >> out2.\n(clean_data >> ToJson) >+> out2.\nout2 >> Display.\n"
    },
    "agent_1_data_cleaning_02_replace_chars": {
        "name": "[Data Cleaning] 02 Replace Chars",
        "code": "[\"123-456-7890\", \" 987 654 3210 \", \"555-0000\"] >> phone_list.\n\n\"--- Cleaning Phone Numbers ---\" >> Display.\n\nphone_list >> Map:\n    (@ & \"-\" & \"\") >> Replace >> step1.\n    (step1 & \" \" & \"\") >> Replace >> Return.\n.. >> clean_phones.\n\n\"Cleaned Phones: \" >> msg.\n(clean_phones >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_03_fill_missing": {
        "name": "[Data Cleaning] 03 Fill Missing",
        "code": "[\"Alice\", null, \"Bob\", null, \"Charlie\"] >> names.\n\n\"--- Filling Missing Data ---\" >> Display.\n\nnames >> Map:\n    @ >> Type >> check:\n        is \"null\": \"UNKNOWN\" >> Return.\n    ..\n    @ >> Return.\n.. >> filled_names.\n\n\"Filled Data: \" >> msg.\n(filled_names >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_04_normalize_case": {
        "name": "[Data Cleaning] 04 Normalize Case",
        "code": "[\"ALICE\", \"bob\", \"ChArLiE\", null] >> names.\n\n\"--- Normalizing Case ---\" >> Display.\n\nnames >> Map:\n    @ >> Type >> check:\n        is \"null\": \"\" >> Return.\n    ..\n    @ >> Uppercase >> Return.\n.. >> normalized_names.\n\n\"Normalized: \" >> msg.\n(normalized_names >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_05_remove_outliers": {
        "name": "[Data Cleaning] 05 Remove Outliers",
        "code": "[-10, 50, 120, 75, 100, -5, 25] >> values.\n\n\"--- Removing Outliers ---\" >> Display.\n\nvalues >> Filter:\n    @ >> check:\n        is < 0: false >> Return.\n        is > 100: false >> Return.\n    ..\n    true >> Return.\n.. >> valid_values.\n\n\"Valid values: \" >> msg.\n(valid_values >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_06_extract_domain": {
        "name": "[Data Cleaning] 06 Extract Domain",
        "code": "[\"user1@example.com\", \"admin@test.org\", \"invalid-email\"] >> emails.\n\n\"--- Extracting Domains ---\" >> Display.\n\nemails >> Map:\n    (@ & \"@\") >> Split >> parts.\n    parts >> Length >> check:\n        is 2: parts[1] >> Return.\n    ..\n    \"invalid\" >> Return.\n.. >> domains.\n\n\"Domains: \" >> msg.\n(domains >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_07_validate_age": {
        "name": "[Data Cleaning] 07 Validate Age",
        "code": "[\"25\", \"-5\", \"30\", \"invalid\"] >> ages_str.\n\n\"--- Validating Ages ---\" >> Display.\n\nages_str >> Map:\n    @ >> Int >> catch:\n        -1 >> Return.\n    .. >> age.\n    \n    age >> check:\n        is < 0: -1 >> Return.\n    ..\n    age >> Return.\n.. >> ages_int.\n\n\"Ages: \" >> msg.\n(ages_int >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_08_aggregate_totals": {
        "name": "[Data Cleaning] 08 Aggregate Totals",
        "code": "[100, -50, 200, null, 50] >> transactions.\n\n\"--- Aggregating Totals ---\" >> Display.\n\ntransactions >> Filter:\n    @ >> check:\n        is null: false >> Return.\n        is < 0: false >> Return.\n    ..\n    true >> Return.\n.. >> valid_tx.\n\nvalid_tx >> Reduce:\n    (@[0] & @[1]) >> Add >> Return.\n.. >> total.\n\n\"Total: \" >> msg.\n(total >> Str) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_09_clean_dict_keys": {
        "name": "[Data Cleaning] 09 Clean Dict Keys",
        "code": "[\n    {\"name\": \"Alice\", \"age\": 25},\n    {\"age\": 30},\n    {\"name\": \"Bob\"}\n] >> records.\n\n\"--- Cleaning Records ---\" >> Display.\n\nrecords >> Map:\n    @ >> record.\n    \n    (record & \"name\") >> Contains >> check:\n        is false:\n            (record & \"name\" & \"Unknown\") >> Set >> record.\n    ..\n    \n    (record & \"age\") >> Contains >> check:\n        is false:\n            (record & \"age\" & 0) >> Set >> record.\n    ..\n    \n    record >> Return.\n.. >> clean_records.\n\n\"Cleaned: \" >> msg.\n(clean_records >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_10_full_pipeline": {
        "name": "[Data Cleaning] 10 Full Pipeline",
        "code": "[\"  data 1 \", null, \"  \", \"data 2\"] >> raw_data.\n\n\"--- Full Pipeline ---\" >> Display.\n\nraw_data >> Map:\n    @ >> check:\n        is null: \"\" >> Return.\n    ..\n    (@ & \" \" & \"\") >> Replace >> Return.\n.. >> clean_str.\n\nclean_str >> Filter:\n    @ >> Length >> check:\n        is > 0: true >> Return.\n    ..\n    false >> Return.\n.. >> processed.\n\nprocessed >> Fork:\n    -> \"Result: \" >> r_msg.\n       (@ >> ToJson) >+> r_msg.\n       r_msg >> Display.\n    -> @ >> Length >> Str >> len_str.\n       \"Count: \" >> c_msg.\n       len_str >+> c_msg.\n       c_msg >> Display.\n..\n"
    },
    "agent_1_data_cleaning_test_catch": {
        "name": "[Data Cleaning] Test Catch",
        "code": "[\"25\", \"-5\", \"30\", \"invalid\"] >> ages_str.\n\nages_str >> Map:\n    @ >> Int >> catch:\n        -1 >> Return.\n    .. >> age.\n    \n    age >> check:\n        is < 0: -1 >> Return.\n    ..\n    age >> Return.\n.. >> ages_int.\n\n\"Ages: \" >> msg.\n(ages_int >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_test_check": {
        "name": "[Data Cleaning] Test Check",
        "code": "[100] >> Filter:\n    @ >> Type >> Display.\n    @ >> check:\n        is < 0: false >> Return.\n    ..\n    true >> Return.\n.. >> dummy.\n"
    },
    "agent_1_data_cleaning_test_concat": {
        "name": "[Data Cleaning] Test Concat",
        "code": "\"Result: \" >> msg.\n\"[\" >+> msg.\n\"]\" >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_test_contains": {
        "name": "[Data Cleaning] Test Contains",
        "code": "({\"a\": 1} & \"a\") >> Contains >> Display.\n({\"a\": 1} & \"b\") >> Contains >> Display.\n"
    },
    "agent_1_data_cleaning_test_dict": {
        "name": "[Data Cleaning] Test Dict",
        "code": "[\n    {\"name\": \"Alice\", \"age\": 25},\n    {\"age\": 30},\n    {\"name\": \"Bob\"}\n] >> records.\n\nrecords >> Map:\n    @ >> record.\n    \n    (record & \"name\") >> Get >> catch:\n        null >> Return. \n    .. >> name_val.\n    \n    name_val >> check:\n        is null:\n            (record & \"name\" & \"Unknown\") >> Set >> record.\n    ..\n\n    (record & \"age\") >> Get >> catch:\n        null >> Return.\n    .. >> age_val.\n    \n    age_val >> check:\n        is null:\n            (record & \"age\" & 0) >> Set >> record.\n    ..\n    \n    record >> Return.\n.. >> clean_records.\n\n\"Cleaned: \" >> msg.\n(clean_records >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_test_dict2": {
        "name": "[Data Cleaning] Test Dict2",
        "code": "[{\"name\": \"Alice\"}, {\"age\": 30}] >> records.\n\nrecords >> Map:\n    @ >> record.\n    (record & \"name\") >> Contains >> check:\n        is false:\n            (record & \"name\" & \"Unknown\") >> Set >> record.\n    ..\n    record >> Return.\n.. >> clean_records.\n\n(clean_records >> ToJson) >> Display.\n"
    },
    "agent_1_data_cleaning_test_filter": {
        "name": "[Data Cleaning] Test Filter",
        "code": "new IsNotNull:\n    @ >> check:\n        is null: false >> Return.\n    ..\n    true >> Return.\n..\n\n[\"Data1\", null, \"Data2\", null, \"Data3\"] >> raw_data.\nraw_data >-> IsNotNull >> clean_data.\nclean_data >> Display.\n"
    },
    "agent_1_data_cleaning_test_filter2": {
        "name": "[Data Cleaning] Test Filter2",
        "code": "[1, 2, 3, 4] >> Filter:\n    @ >> check:\n        is > 2: true >> Return.\n    ..\n    false >> Return.\n.. >> res.\n\n(\"Result: %s\" & (res >> ToJson)) >> Format >> Display.\n"
    },
    "agent_1_data_cleaning_test_filter3": {
        "name": "[Data Cleaning] Test Filter3",
        "code": "[1, 2, 3, 4] >> Filter:\n    @ >> check:\n        is > 2: true >> Return.\n    ..\n    false >> Return.\n.. >> res.\n\n\"Result: \" >> msg.\n(res >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_test_format": {
        "name": "[Data Cleaning] Test Format",
        "code": "[\"A\", \"B\"] >> ToJson >> json_str.\n(\"Result: %s\" & json_str) >> Format >> Display.\n"
    },
    "agent_1_data_cleaning_test_map": {
        "name": "[Data Cleaning] Test Map",
        "code": "[\"a@b\", \"c@d\"] >> Map:\n    (@ & \"@\") >> Split >> parts.\n    parts[1] >> Return.\n.. >> res.\n\n\"Result: \" >> msg.\n(res >> ToJson) >+> msg.\nmsg >> Display.\n"
    },
    "agent_1_data_cleaning_test_split": {
        "name": "[Data Cleaning] Test Split",
        "code": "(\"a@b\" & \"@\") >> Split >> Display.\n"
    },
    "agent_2_etl_ecommerce_cart": {
        "name": "[Etl] Ecommerce Cart",
        "code": "// ecommerce_cart.pop\n[\n    {\"item\": \"Laptop\", \"price\": 1200, \"stock\": 5, \"qty\": 1},\n    {\"item\": \"Mouse\", \"price\": 25, \"stock\": 0, \"qty\": 2},\n    {\"item\": \"Keyboard\", \"price\": 75, \"stock\": 10, \"qty\": 1},\n    {\"item\": \"Monitor\", \"price\": 300, \"stock\": 2, \"qty\": 3}\n] >> cart.\n\ncart >> Map:\n    @[\"qty\"] >> q.\n    @[\"stock\"] >> s.\n    q >> check:\n        is > s:\n            (@ & \"qty\" & s) >> Set >> Return.\n        else:\n            @ >> Return.\n    ..\n.. >> adjusted_cart.\n\nadjusted_cart >> Filter:\n    @[\"qty\"] >> check:\n        is > 0: true >> Return.\n        else: false >> Return.\n    ..\n.. >> valid_cart.\n\nvalid_cart >> Map:\n    (@[\"price\"] * @[\"qty\"]) >> Return.\n.. >> subtotals.\n\nsubtotals >> Reduce:\n    (@[0] + @[1]) >> Return.\n.. >> total_amount.\n\ntotal_amount >> check:\n    is > 1000:\n        (total_amount * 0.9) >> total_amount.\n    else:\n        total_amount >> total_amount.\n..\n\n\"Final Cart Items:\" >> Display.\nvalid_cart >> ToJson >> Display.\n(\"Total Amount to Pay: $%s\" & total_amount) >> Format >> Display.\n"
    },
    "agent_2_etl_financial_ledger": {
        "name": "[Etl] Financial Ledger",
        "code": "// financial_ledger.pop\n[\n    {\"type\": \"income\", \"amount\": 5000, \"desc\": \"Salary\"},\n    {\"type\": \"expense\", \"amount\": 1500, \"desc\": \"Rent\"},\n    {\"type\": \"expense\", \"amount\": 200, \"desc\": \"Groceries\"},\n    {\"type\": \"income\", \"amount\": 300, \"desc\": \"Freelance\"},\n    {\"type\": \"expense\", \"amount\": 100, \"desc\": \"Utilities\"}\n] >> ledger.\n\n0 >> total_income.\n0 >> total_expense.\n\nledger >> ストリーム・ブロック\n    tx.\n    tx[\"type\"] >> t.\n    tx[\"amount\"] >> amt.\n    t >> check:\n        is \"income\":\n            (total_income + amt) >> total_income.\n        is \"expense\":\n            (total_expense + amt) >> total_expense.\n        else:\n            0 >> nothing.\n    ..\n..\n\n(total_income - total_expense) >> balance.\n\n\"--- Financial Summary ---\" >> Display.\n(\"Total Income: $%s\" & total_income) >> Format >> Display.\n(\"Total Expense: $%s\" & total_expense) >> Format >> Display.\n(\"Net Balance: $%s\" & balance) >> Format >> Display.\n\nbalance >> check:\n    is < 0:\n        \"WARNING: Negative Balance!\" >> Display.\n    else:\n        \"Finances are healthy.\" >> Display.\n..\n"
    },
    "agent_2_etl_inventory_etl": {
        "name": "[Etl] Inventory Etl",
        "code": "// inventory_etl.pop\n[\n    {\"item\": \"A\", \"type\": \"stock\", \"qty\": 100},\n    {\"item\": \"B\", \"type\": \"stock\", \"qty\": 50},\n    {\"item\": \"A\", \"type\": \"sale\", \"qty\": 20},\n    {\"item\": \"A\", \"type\": \"shipment\", \"qty\": 50},\n    {\"item\": \"C\", \"type\": \"stock\", \"qty\": 10},\n    {\"item\": \"B\", \"type\": \"sale\", \"qty\": 45}\n] >> events.\n\n{} >> inventory.\n[] >> items.\n\nevents >> ストリーム・ブロック\n    ev.\n    ev[\"item\"] >> i.\n    ev[\"type\"] >> t.\n    ev[\"qty\"] >> q.\n    \n    (items & i) >> Contains >> has_i.\n    has_i >> check:\n        is false:\n            i >+> items.\n            (inventory & i & 0) >> Set >> inventory.\n        else:\n            0 >> n.\n    ..\n\n    (inventory & i) >> Get >> current_qty.\n\n    t >> check:\n        is \"stock\":\n            (inventory & i & q) >> Set >> inventory.\n        is \"sale\":\n            (inventory & i & (current_qty - q)) >> Set >> inventory.\n        is \"shipment\":\n            (inventory & i & (current_qty + q)) >> Set >> inventory.\n        else:\n            0 >> n.\n    ..\n..\n\n\"Inventory Status:\" >> Display.\ninventory >> ToJson >> Display.\n\n\"Low Stock Alerts (< 10):\" >> Display.\nitems >> ストリーム・ブロック\n    i.\n    (inventory & i) >> Get >> q.\n    q >> check:\n        is < 10:\n            (\"ALERT: %s is low on stock (%s)\" & i & q) >> Format >> Display.\n        else:\n            0 >> n.\n    ..\n..\n"
    },
    "agent_2_etl_log_parser": {
        "name": "[Etl] Log Parser",
        "code": "// log_parser.pop\n[\n    \"INFO: Server started\",\n    \"ERROR: DB_CONNECTION_FAILED at 10:00\",\n    \"WARN: High memory usage\",\n    \"ERROR: TIMEOUT at 10:05\",\n    \"INFO: User logged in\",\n    \"ERROR: DB_CONNECTION_FAILED at 10:15\",\n    \"ERROR: NULL_POINTER at 10:20\"\n] >> logs.\n\nlogs >> Filter:\n    (@ & \"ERROR:\") >> Contains >> Return.\n.. >> error_logs.\n\nerror_logs >> Map:\n    (@ & \" \") >> Split >> parts.\n    parts[1] >> Return.\n.. >> error_types.\n\n{} >> error_counts.\nerror_types >!> @err_type:\n    (error_counts & @err_type) >> Contains >> exists.\n    exists >> check:\n        is true:\n            (error_counts & @err_type) >> Get >> cnt.\n            (error_counts & @err_type & (cnt + 1)) >> Set >> error_counts.\n        else:\n            (error_counts & @err_type & 1) >> Set >> error_counts.\n    ..\n..\n\nerror_types >> Length >> len.\n(\"Total Errors Found: %s\" & len) >> Format >> Display.\n\"Error Frequencies:\" >> Display.\nerror_counts >> ToJson >> Display.\n"
    },
    "agent_2_etl_sales_aggregator": {
        "name": "[Etl] Sales Aggregator",
        "code": "// sales_aggregator.pop\n[\n    {\"id\": 1, \"amount\": 150, \"category\": \"electronics\"},\n    {\"id\": 2, \"amount\": 50, \"category\": \"books\"},\n    {\"id\": 3, \"amount\": 200, \"category\": \"electronics\"},\n    {\"id\": 4, \"amount\": 20, \"category\": \"books\"},\n    {\"id\": 5, \"amount\": 300, \"category\": \"furniture\"}\n] >> raw_sales.\n\nraw_sales >> Map:\n    @[\"amount\"] >> Return.\n.. >> amounts.\n\namounts >> Reduce:\n    (@[0] + @[1]) >> Return.\n.. >> total_sales.\n\namounts >> Length >> count.\n(total_sales / count) >> avg_sale.\n\n{} >> grouped.\nraw_sales >!> @item:\n    @item[\"category\"] >> cat.\n    @item[\"amount\"] >> amt.\n    (grouped & cat) >> Contains >> has_cat.\n    has_cat >> check:\n        is true:\n            (grouped & cat) >> Get >> cur.\n            (grouped & cat & (cur + amt)) >> Set >> grouped.\n        else:\n            (grouped & cat & amt) >> Set >> grouped.\n    ..\n..\n\n\"--- ETL Results ---\" >> Display.\n(\"Total Sales: %s\" & total_sales) >> Format >> Display.\n(\"Average Sale: %s\" & avg_sale) >> Format >> Display.\n\"Grouped Sales:\" >> Display.\ngrouped >> ToJson >> Display.\n"
    },
    "agent_2_etl_sensor_data": {
        "name": "[Etl] Sensor Data",
        "code": "// sensor_data.pop\n[\n    {\"sensor\": \"temp\", \"val\": 22.5},\n    {\"sensor\": \"temp\", \"val\": -999.0},\n    {\"sensor\": \"temp\", \"val\": 23.1},\n    {\"sensor\": \"temp\", \"val\": 22.8},\n    {\"sensor\": \"temp\", \"val\": 1000.0},\n    {\"sensor\": \"temp\", \"val\": 21.9}\n] >> readings.\n\nreadings >> Filter:\n    @[\"val\"] >> v.\n    v >> check:\n        is < -50.0: false >> Return.\n        is > 100.0: false >> Return.\n        else: true >> Return.\n    ..\n.. >> clean_readings.\n\nclean_readings >> Map:\n    @[\"val\"] >> Return.\n.. >> values.\n\nvalues >> Reduce:\n    (@[0] + @[1]) >> Return.\n.. >> total.\n\nvalues >> Reduce:\n    @[0] >> a.\n    @[1] >> b.\n    a >> check:\n        is > b: a >> Return.\n        else: b >> Return.\n    ..\n.. >> maximum.\n\nvalues >> Reduce:\n    @[0] >> a.\n    @[1] >> b.\n    a >> check:\n        is < b: a >> Return.\n        else: b >> Return.\n    ..\n.. >> minimum.\n\nvalues >> Length >> len.\n(total / len) >> average.\n\n(\"Valid Readings Count: %s\" & len) >> Format >> Display.\n(\"Min Temp: %s\" & minimum) >> Format >> Display.\n(\"Max Temp: %s\" & maximum) >> Format >> Display.\n(\"Avg Temp: %s\" & average) >> Format >> Display.\n"
    },
    "agent_2_etl_student_grades": {
        "name": "[Etl] Student Grades",
        "code": "// student_grades.pop\n[\n    {\"name\": \"Alice\", \"math\": 85, \"science\": 92, \"english\": 88},\n    {\"name\": \"Bob\", \"math\": 60, \"science\": 55, \"english\": 70},\n    {\"name\": \"Charlie\", \"math\": 95, \"science\": 98, \"english\": 90},\n    {\"name\": \"David\", \"math\": 40, \"science\": 45, \"english\": 50}\n] >> students.\n\nnew CalcGPA:\n    ((@[\"math\"] + @[\"science\"] + @[\"english\"]) / 3) >> avg.\n    {\"name\": @[\"name\"], \"gpa\": avg} >> Return.\n..\n\nstudents >~> CalcGPA >> gpa_list.\n\nnew IsPass:\n    @[\"gpa\"] >> check:\n        is >= 60: true >> Return.\n        else: false >> Return.\n    ..\n..\n\ngpa_list >-> IsPass >> passed.\n\nnew GetGPA:\n    @[\"gpa\"] >> Return.\n..\n\ngpa_list >~> GetGPA >> all_gpas.\n\nnew MaxReducer:\n    @[0] >> a.\n    @[1] >> b.\n    a >> check:\n        is > b: a >> Return.\n        else: b >> Return.\n    ..\n..\nall_gpas >=> MaxReducer >> highest_gpa.\n\n\"Student Grades ETL\" >> Display.\n(\"Highest GPA: %s\" & highest_gpa) >> Format >> Display.\n\"Students who passed:\" >> Display.\npassed >> ToJson >> Display.\n"
    },
    "agent_2_etl_user_activity": {
        "name": "[Etl] User Activity",
        "code": "// user_activity.pop\n[\n    {\"user\": \"Alice\", \"minutes\": 120},\n    {\"user\": \"Bob\", \"minutes\": 45},\n    {\"user\": \"Charlie\", \"minutes\": 200},\n    {\"user\": \"Alice\", \"minutes\": 30},\n    {\"user\": \"Bob\", \"minutes\": 60}\n] >> activities.\n\n{} >> user_totals.\n[] >> unique_users.\n\nactivities >!> @act:\n    @act[\"user\"] >> u.\n    @act[\"minutes\"] >> m.\n    (user_totals & u) >> Contains >> has_u.\n    has_u >> check:\n        is true:\n            (user_totals & u) >> Get >> current_m.\n            (user_totals & u & (current_m + m)) >> Set >> user_totals.\n        else:\n            (user_totals & u & m) >> Set >> user_totals.\n            u >+> unique_users.\n    ..\n..\n\n\"\" >> max_user.\n0 >> max_mins.\n\nunique_users >!> @u:\n    (user_totals & @u) >> Get >> m.\n    m >> check:\n        is > max_mins:\n            m >> max_mins.\n            @u >> max_user.\n        else:\n            0 >> nothing.\n    ..\n..\n\n\"User Totals:\" >> Display.\nuser_totals >> ToJson >> Display.\n(\"Most Active User: %s with %s minutes.\" & max_user & max_mins) >> Format >> Display.\n"
    },
    "agent_2_etl_weather_etl": {
        "name": "[Etl] Weather Etl",
        "code": "// weather_etl.pop\n[\n    {\"city\": \"Tokyo\", \"temp\": 30, \"humidity\": 70},\n    {\"city\": \"Osaka\", \"temp\": 32, \"humidity\": 65},\n    {\"city\": \"Sapporo\", \"temp\": 22, \"humidity\": 50},\n    {\"city\": \"Tokyo\", \"temp\": 31, \"humidity\": 72},\n    {\"city\": \"Okinawa\", \"temp\": 35, \"humidity\": 80}\n] >> weather_data.\n\nnew GetTemp:\n    @[\"temp\"] >> Return.\n..\nnew GetHum:\n    @[\"humidity\"] >> Return.\n..\n\nweather_data >~> GetTemp >> temps.\nweather_data >~> GetHum >> hums.\n\nnew MaxReducer:\n    @[0] >> a.\n    @[1] >> b.\n    a >> check:\n        is > b: a >> Return.\n        else: b >> Return.\n    ..\n..\n\ntemps >=> MaxReducer >> highest_temp.\n\nnew Sum:\n    (@[0] + @[1]) >> Return.\n..\nhums >=> Sum >> total_hum.\nhums >> Length >> len.\n(total_hum / len) >> avg_hum.\n\n\"Weather ETL Report\" >> Display.\n(\"Highest Temperature recorded: %s C\" & highest_temp) >> Format >> Display.\n(\"Average Humidity: %s percent\" & avg_hum) >> Format >> Display.\n\n[] >> hot_cities.\nweather_data >> ストリーム・ブロック\n    w.\n    w[\"temp\"] >> check:\n        is > 30:\n            w[\"city\"] >+> hot_cities.\n        else:\n            0 >> n.\n    ..\n..\n\n\"Hot Cities (>30C):\" >> Display.\nhot_cities >> Display.\n"
    },
    "agent_2_etl_web_analytics": {
        "name": "[Etl] Web Analytics",
        "code": "// web_analytics.pop\n[\n    {\"ip\": \"192.168.1.1\", \"page\": \"/home\", \"time\": 10},\n    {\"ip\": \"192.168.1.2\", \"page\": \"/about\", \"time\": 45},\n    {\"ip\": \"192.168.1.1\", \"page\": \"/contact\", \"time\": 20},\n    {\"ip\": \"192.168.1.3\", \"page\": \"/home\", \"time\": 15},\n    {\"ip\": \"192.168.1.2\", \"page\": \"/home\", \"time\": 5},\n    {\"ip\": \"192.168.1.4\", \"page\": \"/products\", \"time\": 120}\n] >> visits.\n\n{} >> page_views.\n{} >> page_times.\n[] >> unique_pages.\n\nvisits >> ストリーム・ブロック\n    v.\n    v[\"page\"] >> p.\n    v[\"time\"] >> t.\n    \n    (unique_pages & p) >> Contains >> has_p.\n    has_p >> check:\n        is false:\n            p >+> unique_pages.\n        else:\n            0 >> n.\n    ..\n\n    (page_views & p) >> Contains >> has_v.\n    has_v >> check:\n        is true:\n            (page_views & p) >> Get >> views.\n            (page_views & p & (views + 1)) >> Set >> page_views.\n            (page_times & p) >> Get >> times.\n            (page_times & p & (times + t)) >> Set >> page_times.\n        else:\n            (page_views & p & 1) >> Set >> page_views.\n            (page_times & p & t) >> Set >> page_times.\n    ..\n..\n\n\"Page Analytics:\" >> Display.\nunique_pages >> ストリーム・ブロック\n    p.\n    (page_views & p) >> Get >> views.\n    (page_times & p) >> Get >> total_time.\n    (total_time / views) >> avg_time.\n    (\"Page: %s | Views: %s | Avg Time: %s s\" & p & views & avg_time) >> Format >> Display.\n..\n"
    },
    "agent_3_nlp_01_word_frequency": {
        "name": "[Nlp] 01 Word Frequency",
        "code": "// 01_word_frequency.pop\n// Calculates the frequency of each word in a text using Map and Reduce.\n\n\"Natural language processing is a fascinating field of artificial intelligence. It involves the analysis of natural language text to extract meaningful insights. Natural language is complex.\" >> raw_text.\n\n// Remove punctuation for cleaner analysis\n(raw_text & \".\" & \"\") >> Replace >> clean1.\n(clean1 & \",\" & \"\") >> Replace >> clean_text.\n\n// Split text into words\n(clean_text & \" \") >> Split >> words.\n\n// Normalize words to lowercase\nwords >> Map @w:\n    @w >> Lowercase >> Return.\n.. >> lower_words.\n\n// Initialize array for Reduce (prepend empty dict)\n[] >> reduce_arr.\n{} >+> reduce_arr.\nlower_words >> Map @w:\n    @w >+> reduce_arr.\n..\n\n// Count frequencies using Reduce\nreduce_arr >> Reduce @dict @word:\n    (@dict & @word) >> Get >> catch:\n        0\n    .. >> count.\n    (@dict & @word & (count + 1)) >> Set >> Return.\n.. >> frequencies.\n\n\"--- Word Frequencies ---\" >> Display.\nfrequencies >> ToJson >> Display.\n"
    },
    "agent_3_nlp_02_longest_word": {
        "name": "[Nlp] 02 Longest Word",
        "code": "// 02_longest_word.pop\n// Finds the longest word in a given text string.\n\n\"In the realm of computational linguistics, identifying the longest contiguous sequence of characters is a fundamental task.\" >> text.\n\n// Clean the text\n(text & \",\" & \"\") >> Replace >> clean1.\n(clean1 & \".\" & \"\") >> Replace >> clean_text.\n\n// Split into words\n(clean_text & \" \") >> Split >> words.\n\n// Use Reduce to find the maximum length word\nwords >> Reduce @longest @current:\n    @longest >> Length >> len_longest.\n    @current >> Length >> len_current.\n    \n    len_current >> check:\n        is > len_longest:\n            @current >> Return.\n        else:\n            @longest >> Return.\n    ..\n.. >> longest_word.\n\nlongest_word >> Length >> longest_len.\n\n\"--- Longest Word Result ---\" >> Display.\n(\"Text: \" + text) >> Display.\n(\"Longest word: \" + longest_word) >> Display.\n(\"Length: \" + (longest_len >> Str)) >> Display.\n"
    },
    "agent_3_nlp_03_text_formatter": {
        "name": "[Nlp] 03 Text Formatter",
        "code": "// 03_text_formatter.pop\n// Formats a text by converting it to Title Case (capitalizing the first letter of each word).\n\n\"this is a raw unformatted text. it needs to be properly formatted and title cased for display purposes.\" >> text.\n\n(\"Original: \" + text) >> Display.\n\n(text & \" \") >> Split >> words.\n\nwords >> Map @w:\n    @w >> Length >> l.\n    l >> check:\n        is > 0:\n            (@w & 0 & 1) >> Slice >> Uppercase >> first_char.\n            (@w & 1 & l) >> Slice >> Lowercase >> rest.\n            (first_char + rest) >> Return.\n        else:\n            @w >> Return.\n    ..\n.. >> title_words.\n\n// Join the words back into a single string\n(title_words & \" \") >> Join >> formatted_text.\n\n\"--- Formatted Result ---\" >> Display.\nformatted_text >> Display.\n"
    },
    "agent_3_nlp_04_sentence_stats": {
        "name": "[Nlp] 04 Sentence Stats",
        "code": "// 04_sentence_stats.pop\n// Analyzes sentences in a text, counts words per sentence, and filters out short ones.\n\n\"Natural language processing is hard. But it is very rewarding. AI. This sentence has enough words to pass the filter. Short.\" >> text.\n\n// Split into sentences\n(text & \".\") >> Split >> sentences.\n\n// We will map each sentence to a dictionary containing the sentence and its word count\nsentences >> Map @s:\n    // Basic cleanup\n    (@s & \",\" & \"\") >> Replace >> s_clean.\n    (s_clean & \" \") >> Split >> raw_words.\n    \n    // Filter out empty words caused by spaces\n    raw_words >> Filter @w:\n        @w >> Length >> l.\n        l >> check:\n            is > 0: true >> Return.\n            else: false >> Return.\n        ..\n    .. >> actual_words.\n    \n    actual_words >> Length >> word_count.\n    \n    {} >> stat.\n    (stat & \"sentence\" & @s) >> Set >> stat1.\n    (stat1 & \"word_count\" & word_count) >> Set >> Return.\n.. >> sentence_stats.\n\n// Now filter out sentences with 3 or fewer words\nsentence_stats >> Filter @stat:\n    (@stat & \"word_count\") >> Get >> count.\n    count >> check:\n        is > 3: true >> Return.\n        else: false >> Return.\n    ..\n.. >> long_sentences.\n\n\"--- Long Sentences Only (Word Count > 3) ---\" >> Display.\nlong_sentences >> ToJson >> Display.\n"
    },
    "agent_3_nlp_05_sentiment_mock": {
        "name": "[Nlp] 05 Sentiment Mock",
        "code": "// 05_sentiment_mock.pop\n// Simulates a basic sentiment analysis by scoring words based on a dictionary.\n\n\"The new movie was absolutely fantastic and wonderful. However, the ending was terrible and bad.\" >> text.\n\n// Define our mock sentiment lexicon\n{} >> lexicon.\n(lexicon & \"fantastic\" & 2) >> Set >> lex1.\n(lex1 & \"wonderful\" & 2) >> Set >> lex2.\n(lex2 & \"good\" & 1) >> Set >> lex3.\n(lex3 & \"terrible\" & -2) >> Set >> lex4.\n(lex4 & \"bad\" & -1) >> Set >> sentiment_dict.\n\n// Clean and split the text\n(text & \".\" & \"\") >> Replace >> c1.\n(c1 & \",\" & \"\") >> Replace >> c2.\n(c2 & \" \") >> Split >> words.\n\n// Reduce to calculate total sentiment score\n[0] >> reduce_arr.\nwords >> Map @w:\n    @w >> Lowercase >+> reduce_arr.\n..\n\nreduce_arr >> Reduce @score @word:\n    (sentiment_dict & @word) >> Get >> catch:\n        0 // If word not found, score is 0\n    .. >> word_score.\n    \n    (@score + word_score) >> Return.\n.. >> total_score.\n\n\"--- Sentiment Analysis ---\" >> Display.\n(\"Text: \" + text) >> Display.\n(\"Total Score: \" + (total_score >> Str)) >> Display.\n\ntotal_score >> check:\n    is > 0: \"Overall Sentiment: POSITIVE\" >> Display.\n    is < 0: \"Overall Sentiment: NEGATIVE\" >> Display.\n    else: \"Overall Sentiment: NEUTRAL\" >> Display.\n..\n"
    },
    "agent_3_nlp_06_keyword_extractor": {
        "name": "[Nlp] 06 Keyword Extractor",
        "code": "// 06_keyword_extractor.pop\n// Extracts keywords from a text by filtering out common stop words.\n\n\"PopPop is a great programming language for data flow and text processing. It makes pipelines easy.\" >> document.\n\n// Define a list of stop words\n[\"is\", \"a\", \"for\", \"and\", \"it\", \"to\", \"the\", \"in\", \"of\"] >> stop_words.\n\n// Clean the text and convert to lowercase\n(document & \".\" & \"\") >> Replace >> c1.\n(c1 & \",\" & \"\") >> Replace >> clean_doc.\n(clean_doc & \" \") >> Split >> words.\n\n// Filter out the stop words\nwords >> Filter @w:\n    @w >> Lowercase >> lw.\n    (stop_words & lw) >> Contains >> is_stop.\n    is_stop >> check:\n        is true: false >> Return. // It is a stop word, discard\n        else: true >> Return.    // Not a stop word, keep\n    ..\n.. >> keywords.\n\n// Remove empty strings if any\nkeywords >> Filter @k:\n    @k >> Length >> l.\n    l >> check:\n        is > 0: true >> Return.\n        else: false >> Return.\n    ..\n.. >> final_keywords.\n\n\"--- Keyword Extraction ---\" >> Display.\n(\"Original: \" + document) >> Display.\n\"Keywords: \" >> Display.\nfinal_keywords >> ToJson >> Display.\n"
    },
    "agent_3_nlp_07_palindrome_checker": {
        "name": "[Nlp] 07 Palindrome Checker",
        "code": "// 07_palindrome_checker.pop\n// Analyzes a text and identifies all palindromic words.\n\n\"A man saw a racecar and a kayak at noon level.\" >> text.\n\n(text & \".\" & \"\") >> Replace >> c1.\n(c1 & \" \") >> Split >> words.\n\n// Filter out palindromes\nwords >> Filter @w:\n    @w >> Lowercase >> lower_w.\n    lower_w >> Length >> l.\n    \n    // Ignore single letter words like 'a'\n    l >> check:\n        is <= 1: false >> Return.\n    ..\n    \n    lower_w >> Reverse >> reversed_w.\n    \n    lower_w >> check:\n        is reversed_w: true >> Return.\n        else: false >> Return.\n    ..\n.. >> palindromes.\n\n\"--- Palindrome Checker ---\" >> Display.\n(\"Original text: \" + text) >> Display.\n\"Palindromes found: \" >> Display.\npalindromes >> ToJson >> Display.\n"
    },
    "agent_3_nlp_08_word_replacer": {
        "name": "[Nlp] 08 Word Replacer",
        "code": "// 08_word_replacer.pop\n// Replaces specific sensitive words with asterisks (censorship simulation).\n\n\"The secret password is apple and the hidden base is in london. Do not tell anyone about apple.\" >> message.\n\n// Dictionary of words to replace\n{} >> filter_dict.\n(filter_dict & \"apple\" & \"***\") >> Set >> f1.\n(f1 & \"london\" & \"******\") >> Set >> f2.\n(f2 & \"password\" & \"********\") >> Set >> censorship_map.\n\n// Split into words\n(message & \".\" & \"\") >> Replace >> no_dot.\n(no_dot & \" \") >> Split >> words.\n\n// Map words to their replacements if they exist in the dictionary\nwords >> Map @w:\n    @w >> Lowercase >> lw.\n    \n    (censorship_map & lw) >> Get >> catch:\n        // If the word is not in the censorship map, return the original word\n        @w >> Return.\n    .. >> replacement.\n    \n    replacement >> Return.\n.. >> censored_words.\n\n// Join the censored words back into a sentence\n(censored_words & \" \") >> Join >> censored_message.\n(censored_message + \".\") >> final_message.\n\n\"--- Word Replacer ---\" >> Display.\n(\"Original: \" + message) >> Display.\n(\"Censored: \" + final_message) >> Display.\n"
    },
    "agent_3_nlp_09_text_summarizer": {
        "name": "[Nlp] 09 Text Summarizer",
        "code": "// 09_text_summarizer.pop\n// A mock text summarizer that scores sentences based on keyword matching and length.\n\n\"Artificial intelligence is rapidly evolving. Many companies are investing in AI research. This is just a short filler. The future of machine learning will change how we interact with technology completely. Bye.\" >> text.\n\n// Split into sentences\n(text & \".\") >> Split >> raw_sentences.\n\n// Filter out empty sentences\nraw_sentences >> Filter @s:\n    @s >> Length >> l.\n    l >> check:\n        is > 2: true >> Return.\n        else: false >> Return.\n    ..\n.. >> sentences.\n\n[\"intelligence\", \"evolving\", \"research\", \"machine\", \"technology\"] >> important_keywords.\n\nsentences >> Map @s:\n    // Score based on length\n    @s >> Length >> score.\n    \n    // Return a bundle of score and sentence\n    (score & @s) >> Return.\n.. >> scored_sentences.\n\n// Sort sentences by score (Sort stream sorts by the value returned from the block)\nscored_sentences >> Sort:\n    // @[0] is the score, @[1] is the sentence.\n    // We want descending order, so return negative score.\n    (0 - @[0]) >> Return.\n.. >> sorted_sentences.\n\n// Extract the top 2 sentences\n(sorted_sentences & 0 & 2) >> Slice >> top_2_bundles.\n\n// Extract just the sentences from the bundles\ntop_2_bundles >> Map @bundle:\n    @bundle[1] >> Return.\n.. >> summary_sentences.\n\n// Join them\n(summary_sentences & \". \") >> Join >> summary.\n(summary + \".\") >> final_summary.\n\n\"--- Text Summarizer ---\" >> Display.\n(\"Original Text: \" + text) >> Display.\n(\"Summary: \" + final_summary) >> Display.\n"
    },
    "agent_3_nlp_10_vowel_consonant_counter": {
        "name": "[Nlp] 10 Vowel Consonant Counter",
        "code": "// 10_vowel_consonant_counter.pop\n// Counts the number of vowels and consonants in a given text.\n\n\"PopPop is a data flow language that makes text processing incredibly easy and readable.\" >> text.\n\n(text >> Lowercase) >> lower_text.\n\n// We don't have character array conversion built-in.\n// But we can split by empty string? Let's check if it works. \n// If not, we can split by space and process each word.\n(lower_text & \" \") >> Split >> words.\n\n// Combine into one continuous string without spaces\n(words & \"\") >> Join >> no_space_text.\n\n// We want to count vowels.\n[\"a\", \"e\", \"i\", \"o\", \"u\"] >> vowels.\n\n// Let's create an array of all characters by extracting them one by one.\nno_space_text >> Length >> text_len.\n(0 & text_len) >> Range >> indices.\n\nindices >> Map @i:\n    (no_space_text & @i & (@i + 1)) >> Slice >> Return.\n.. >> chars.\n\n// Use Reduce to count vowels and consonants\n// [vowels, consonants]\n[0, 0] >> init_counts.\nchars >> Map @c:\n    @c >+> init_counts.\n..\n\ninit_counts >> Reduce @acc @char:\n    @acc[0] >> v_count.\n    @acc[1] >> c_count.\n    \n    (vowels & @char) >> Contains >> is_vowel.\n    is_vowel >> check:\n        is true:\n            ((v_count + 1) & c_count) >> Return.\n        else:\n            // Check if it's an alphabet letter\n            // Simplistic check: length > 0\n            (v_count & (c_count + 1)) >> Return.\n    ..\n.. >> final_counts.\n\n\"--- Vowels vs Consonants ---\" >> Display.\n(\"Text: \" + text) >> Display.\n(\"Vowels: \" + (final_counts[0] >> Str)) >> Display.\n(\"Consonants (incl punctuation): \" + (final_counts[1] >> Str)) >> Display.\n"
    },
    "agent_3_nlp_test1": {
        "name": "[Nlp] Test1",
        "code": "\"hello world hello poppop\" >> text.\n(text & \" \") >> Split >> words.\n\n[] >> arr.\n{} >+> arr.\nwords >> ストリーム・ブロック\n    w.\n    w >+> arr.\n..\narr >> Display.\n\nnew UpdateFreq:\n    @[0] >> dict.\n    @[1] >> word.\n    (dict & word) >> Get >> catch:\n        @ >> err.\n        0 >> Return.\n    .. >> count.\n    (dict & word & (count + 1)) >> Set >> Return.\n..\n\narr >=> UpdateFreq >> result.\nresult >> Display.\n"
    },
    "agent_3_nlp_test2": {
        "name": "[Nlp] Test2",
        "code": "\"hello world hello poppop\" >> text.\n(text & \" \") >> Split >> words.\n\nwords >> Map: @w.\n    @w >> Display.\n..\n"
    },
    "agent_3_nlp_test3": {
        "name": "[Nlp] Test3",
        "code": "\"hello world hello poppop\" >> text.\n(text & \" \") >> Split >> words.\n\nwords >> Map: @w.\n    (@w & \"!\") >> Add >> Return.\n.. >> results.\n\nresults >> Display.\n"
    },
    "agent_3_nlp_test4": {
        "name": "[Nlp] Test4",
        "code": "\"hello world hello poppop\" >> text.\n(text & \" \") >> Split >> words.\n\n[] >> arr.\n{} >+> arr.\nwords >> Map: @w.\n    @w >+> arr.\n..\n\narr >> Reduce: @dict @word.\n    (@dict & @word) >> Get >> catch:\n        @ >> err.\n        0 >> Return.\n    .. >> count.\n    \n    (@dict & @word & (count + 1)) >> Set >> Return.\n.. >> freqs.\n\nfreqs >> Display.\n"
    },
    "agent_3_nlp_test5": {
        "name": "[Nlp] Test5",
        "code": "\"hello world hello poppop\" >> text.\n(text & \" \") >> Split >> words.\n\n[] >> arr.\n{} >+> arr.\nwords >> Map @w:\n    @w >+> arr.\n..\n\narr >> Reduce @dict @word:\n    (@dict & @word) >> Get >> catch:\n        @ >> err.\n        0 >> Return.\n    .. >> count.\n    \n    (@dict & @word & (count + 1)) >> Set >> Return.\n.. >> freqs.\n\nfreqs >> Display.\n"
    },
    "agent_3_nlp_test6": {
        "name": "[Nlp] Test6",
        "code": "{} >> d.\n(d & \"hello\" & 1) >> Set >> d2.\nd2 >> Display.\n(d2 & \"hello\") >> Get >> v.\nv >> Display.\n"
    },
    "agent_3_nlp_test7": {
        "name": "[Nlp] Test7",
        "code": "\"hello world hello poppop\" >> text.\n(text & \" \") >> Split >> words.\n\n[] >> arr.\n{} >+> arr.\nwords >> Map @w:\n    @w >+> arr.\n..\n\narr >> Reduce @dict @word:\n    (@dict & @word) >> Get >> catch:\n        0\n    .. >> count.\n    \n    (@dict & @word & (count + 1)) >> Set >> Return.\n.. >> freqs.\n\nfreqs >> Display.\n"
    },
    "agent_3_nlp_test8": {
        "name": "[Nlp] Test8",
        "code": "(\"hello\" & 0 & 1) >> Slice >> Display.\n"
    },
    "agent_3_nlp_test9": {
        "name": "[Nlp] Test9",
        "code": "\"hello\" >> Reverse >> Display.\n"
    },
    "agent_4_log_parser_log1": {
        "name": "[Log Parser] Log1",
        "code": "[\n    \"[2023-10-01 10:00:01] INFO User logged in\",\n    \"[2023-10-01 10:05:23] ERROR Database connection failed\",\n    \"[2023-10-01 10:10:45] WARNING High memory usage\",\n    \"[2023-10-01 10:15:00] ERROR Timeout occurred\"\n] >> logs.\n\nlogs >> Filter @log:\n    (log & \"ERROR\") >> Contains >> Return.\n.. >> error_logs.\n\nnew ExtractTimestamp:\n    (@ & \"]\") >> Split >> parts.\n    parts[0] >> ts_part.\n    (ts_part & \"[\") >> Split >> inner_parts.\n    inner_parts[1] >> Return.\n..\n\nerror_logs >~> ExtractTimestamp >> timestamps.\n\n\"Error timestamps:\" >> Display.\ntimestamps >!> @ts:\n    ts >> Display.\n..\n"
    },
    "agent_4_log_parser_log10": {
        "name": "[Log Parser] Log10",
        "code": "[\n    \"INFO|Success\",\n    \"ERROR|Failed\",\n    \"MALFORMED_LOG_WITHOUT_PIPE\"\n] >> logs.\n\nnew ParseLog:\n    @ >> msg.\n    (msg & \"|\") >> Contains >> check:\n        is false:\n            (\"Simulated error\" & \"div\") >> Split >> dummy.\n            dummy[10] >> dummy2.\n        else:\n            (msg & \"|\") >> Split >> parts.\n            parts[1].\n    ..\n..\n\n\"Processing logs with error handling:\" >> Display.\nlogs >!> @log:\n    log >> ParseLog >> catch:\n        @ >> err.\n        \"Failed to parse log: \" >+> log >> Display.\n        \"Error info: \" >+> err[\"message\"] >> Display.\n        \"null\"\n    .. >> result.\n    result >> Display.\n..\n"
    },
    "agent_4_log_parser_log2": {
        "name": "[Log Parser] Log2",
        "code": "[\n    \"INFO: User created\",\n    \"DEBUG: Cache miss\",\n    \"INFO: User deleted\",\n    \"ERROR: Null pointer\",\n    \"WARNING: Disk full\",\n    \"INFO: Logout\"\n] >> logs.\n\nnew ExtractLevel:\n    (@ & \":\") >> Split >> parts.\n    parts[0] >> Return.\n..\n\nlogs >> Map @log:\n    log >> ExtractLevel.\n.. >> levels.\n\n{} >> counts.\nlevels >!> @level:\n    (counts & level) >> Get >> catch:\n        @ >> err.\n        0\n    .. >> current_count.\n    \n    (current_count + 1) >> new_count.\n    (counts & level & new_count) >> Set >> counts.\n..\n\n\"Log level counts:\" >> Display.\ncounts >> ToJson >> Display.\n"
    },
    "agent_4_log_parser_log3": {
        "name": "[Log Parser] Log3",
        "code": "[\n    \"MSG: short\",\n    \"MSG: a slightly longer message\",\n    \"MSG: the longest message in the log file\"\n] >> logs.\n\nnew GetMsg:\n    (@ & \": \") >> Split >> parts.\n    parts[1] >> Return.\n..\n\nlogs >> Map @log:\n    log >> GetMsg.\n.. >> messages.\n\nmessages >> Reduce @arr:\n    arr[0] >> a.\n    arr[1] >> b.\n    a >> Length >> len_a.\n    b >> Length >> len_b.\n    len_a >> check:\n        is > len_b:\n            a.\n        else:\n            b.\n    ..\n.. >> longest.\n\n\"Longest message:\" >> Display.\nlongest >> Display.\n"
    },
    "agent_4_log_parser_log4": {
        "name": "[Log Parser] Log4",
        "code": "\"ERROR: disk full\\nWARNING: cpu high\\nINFO: ok\\nERROR: timeout\" >> raw_data.\n(raw_data & \"\\n\") >> Split >> logs.\n\nnew IsError:\n    (@ & \"ERROR\") >> Contains >> Return.\n..\nnew IsWarn:\n    (@ & \"WARNING\") >> Contains >> Return.\n..\n\nlogs >> Filter @log:\n    log >> IsError.\n.. >> errors.\n\nlogs >> Filter @log:\n    log >> IsWarn.\n.. >> warns.\n\n\"Errors found: \" >> Display. \nerrors >> Display.\n\"Warnings found: \" >> Display. \nwarns >> Display.\n"
    },
    "agent_4_log_parser_log5": {
        "name": "[Log Parser] Log5",
        "code": "[\n    \"Connection from 192.168.1.1\",\n    \"Connection from invalid_ip\",\n    \"Connection from 10.0.0.5\"\n] >> logs.\n\nnew ExtractIP:\n    (@ & \"from \") >> Split >> parts.\n    parts[1] >> ip.\n    ip >> Return.\n..\n\nlogs >~> ExtractIP >> ips.\n\nips >> Filter @ip:\n    (ip & \".\") >> Split >> octets.\n    octets >> Length >> len.\n    len >> check:\n        is 4:\n            true >> Return.\n        else:\n            false >> Return.\n    ..\n.. >> valid_ips.\n\n\"Valid IPs:\" >> Display.\nvalid_ips >> Display.\n"
    },
    "agent_4_log_parser_log6": {
        "name": "[Log Parser] Log6",
        "code": "[\n    \"User logged in\",\n    \"Data processed\"\n] >> messages.\n\nnew FormatLog:\n    @ >> msg.\n    null >> Now >> ts.\n    ts >> Str >> ts_str.\n    (ts_str & \" \") >> Split >> ts_parts.\n    ts_parts[1] >> time_only.\n    \"[\" >+> time_only >+> \"] \" >+> msg >> Return.\n..\n\nmessages >~> FormatLog >> formatted.\n\n\"Formatted Logs:\" >> Display.\nformatted >!> @log:\n    log >> Display.\n..\n"
    },
    "agent_4_log_parser_log7": {
        "name": "[Log Parser] Log7",
        "code": "[\n    \"id,level,msg\",\n    \"1,INFO,Started\",\n    \"2,ERROR,Failed to load\",\n    \"3,DEBUG,Loading config\"\n] >> csv_lines.\n\n(csv_lines & 1 & 4) >> Slice >> data_lines.\n\nnew ParseCSV:\n    (@ & \",\") >> Split >> parts.\n    {} >> my_dict.\n    (my_dict & \"id\" & parts[0]) >> Set >> my_dict.\n    (my_dict & \"level\" & parts[1]) >> Set >> my_dict.\n    (my_dict & \"msg\" & parts[2]) >> Set >> my_dict.\n    my_dict >> Return.\n..\n\ndata_lines >> Map @line:\n    line >> ParseCSV.\n.. >> parsed_logs.\n\n\"Parsed Log Objects:\" >> Display.\nparsed_logs >> ToJson >> Display.\n"
    },
    "agent_4_log_parser_log8": {
        "name": "[Log Parser] Log8",
        "code": "\"CRITICAL\" >> severity.\n\nseverity >> check:\n    is \"CRITICAL\":\n        \"Send SMS alert!\" >> Display.\n    is \"ERROR\":\n        \"Email admin!\" >> Display.\n    is \"WARNING\":\n        \"Log to warning file.\" >> Display.\n    else:\n        \"Normal operation.\" >> Display.\n..\n"
    },
    "agent_4_log_parser_log9": {
        "name": "[Log Parser] Log9",
        "code": "[\n    \"User admin logged in with password=secret\",\n    \"User guest logged in with password=12345\",\n    \"System check OK\"\n] >> logs.\n\nnew MaskPassword:\n    @ >> msg.\n    (msg & \"password=\") >> Contains >> has_pass.\n    has_pass >> check:\n        is true:\n            (msg & \"=\") >> Split >> parts.\n            parts[0] >+> \"=***\" >> Return.\n        else:\n            msg >> Return.\n    ..\n..\n\nlogs >~> MaskPassword >> masked.\n\"Masked logs:\" >> Display.\nmasked >> Display.\n"
    },
    "agent_5_math_basic_stats": {
        "name": "[Math] Basic Stats",
        "code": "// 5. basic_stats.pop\n// Calculates median, mode, and range of a dataset.\n\nnew GetMedian:\n    @ >> arr.\n    arr >> Length >> len.\n    len >> check:\n        is 0: null.\n        else:\n            arr >> Sort:\n                @.\n            .. >> sorted.\n            \n            (len / 2) >> Int >> half.\n            len % 2 >> check:\n                is 1:\n                    sorted[half].\n                else:\n                    (sorted[half - 1] + sorted[half]) / 2.0.\n            ..\n    ..\n..\n\nnew GetRange:\n    @ >> arr.\n    arr >> Length >> len.\n    len >> check:\n        is 0: 0.\n        else:\n            arr >> Max >> max_val.\n            arr >> Min >> min_val.\n            max_val - min_val.\n    ..\n..\n\n[12, 45, 23, 67, 12, 89, 34, 12, 45, 67, 67, 67, 23] >> data.\n\n\"Dataset: \" >> out1.\n(data >> ToJson) >+> out1 >> Display.\n\ndata >> GetMedian >> med.\n\"Median: \" >> out2.\n(med >> Str) >+> out2 >> Display.\n\ndata >> GetRange >> rng.\n\"Range: \" >> out3.\n(rng >> Str) >+> out3 >> Display.\n\n// Mode using Group\ndata >> Group:\n    @.\n.. >> grouped.\n\n\"Grouped Data: \" >> out4.\n(grouped >> ToJson) >+> out4 >> Display.\n"
    },
    "agent_5_math_bubble_sort": {
        "name": "[Math] Bubble Sort",
        "code": "// 4. bubble_sort.pop\n// Bubble sort implementation.\n\nnew BubbleSort:\n    @ >> arr.\n    arr >> Length >> n.\n    \n    n >> check:\n        is <= 1: arr.\n        else:\n            0 >> loop:\n                false >> swapped.\n                (1 & (n - 1)) >> Range >> Map:\n                    @ >> i.\n                    arr[i - 1] > arr[i] >> check:\n                        is true:\n                            arr[i - 1] >> temp.\n                            arr[i] >+> arr[i - 1] >> pop. // wait, no array assignment.\n                            // PopPop doesn't have a[i] = x directly in spec unless Set works?\n                            // Let's use a functional approach for sorting.\n                            true.\n                        else: false.\n                    ..\n                ..\n                Break.\n            ..\n            arr.\n    ..\n..\n"
    },
    "agent_5_math_factorial_comb": {
        "name": "[Math] Factorial Comb",
        "code": "// 7. factorial_comb.pop\n// Calculates factorials, permutations, and combinations.\n\nnew Factorial:\n    @ >> check:\n        is <= 1: 1.\n        else:\n            (1 & @) >> Range >> Reduce:\n                @[0] * @[1].\n            ..\n    ..\n..\n\nnew Permutation:\n    @ >> args.\n    args[0] >> Factorial >> n_fact.\n    (args[0] - args[1]) >> Factorial >> nr_fact.\n    n_fact / nr_fact.\n..\n\nnew Combination:\n    @ >> args.\n    (args[0] & args[1]) >> Permutation >> p.\n    args[1] >> Factorial >> r_fact.\n    p / r_fact.\n..\n\n5 >> Factorial >> f5.\n\"5! = \" >> out1.\n(f5 >> Str) >+> out1 >> Display.\n\n(5 & 3) >> Permutation >> p53.\n\"5 P 3 = \" >> out2.\n(p53 >> Str) >+> out2 >> Display.\n\n(5 & 3) >> Combination >> c53.\n\"5 C 3 = \" >> out3.\n(c53 >> Str) >+> out3 >> Display.\n"
    },
    "agent_5_math_fibonacci": {
        "name": "[Math] Fibonacci",
        "code": "// 3. fibonacci.pop\n// Generates Fibonacci sequence and calculates golden ratio.\n\nnew FibonacciSeq:\n    @ >> n.\n    n >> check:\n        is <= 0: [].\n        is 1: [0].\n        is 2: [0, 1].\n        else:\n            [0, 1] >> seq.\n            (3 & n) >> Range >> Map:\n                seq >> Length >> length.\n                seq[length - 1] + seq[length - 2] >> next_val.\n                next_val >+> seq.\n                next_val.\n            ..\n            seq.\n    ..\n..\n\n15 >> FibonacciSeq >> fib_nums.\n\"Fibonacci (15): \" >> out1.\n(fib_nums >> ToJson) >+> out1 >> Display.\n\nfib_nums >> Length >> length.\nfib_nums[length - 1] / fib_nums[length - 2] >> golden_ratio.\n\"Golden Ratio approx: \" >> out2.\n(golden_ratio >> Str) >+> out2 >> Display.\n"
    },
    "agent_5_math_gcd_lcm": {
        "name": "[Math] Gcd Lcm",
        "code": "// 6. gcd_lcm.pop\n// Calculates Greatest Common Divisor and Least Common Multiple.\n\nnew GCD:\n    @ >> nums.\n    nums[0] >> a.\n    nums[1] >> b.\n    \n    b >> check:\n        is 0: a.\n        else:\n            (b & (a % b)) >> GCD.\n    ..\n..\n\nnew LCM:\n    @ >> nums.\n    nums[0] >> a.\n    nums[1] >> b.\n    \n    a >> check:\n        is 0: 0.\n        else:\n            b >> check:\n                is 0: 0.\n                else:\n                    (a * b) >> Abs >> abs_prod.\n                    (a & b) >> GCD >> gcd_val.\n                    abs_prod / gcd_val.\n            ..\n    ..\n..\n\n(48 & 18) >> GCD >> gcd_res.\n\"GCD of 48 and 18: \" >> out1.\n(gcd_res >> Str) >+> out1 >> Display.\n\n(48 & 18) >> LCM >> lcm_res.\n\"LCM of 48 and 18: \" >> out2.\n(lcm_res >> Str) >+> out2 >> Display.\n"
    },
    "agent_5_math_prime_numbers": {
        "name": "[Math] Prime Numbers",
        "code": "// 2. prime_numbers.pop\n// Checks for prime numbers and generates a list of primes.\n\nnew IsPrime:\n    @ >> num.\n    num >> check:\n        is <= 1: false.\n        is 2: true.\n        else:\n            // Check if even\n            num % 2 >> check:\n                is 0: false.\n                else:\n                    (3 & (num - 1)) >> Range >> candidates.\n                    candidates >> check:\n                        is null: true.\n                        else:\n                            candidates >> Filter:\n                                num % @ >> check:\n                                    is 0: true.\n                                    else: false.\n                                ..\n                            .. >> divisors.\n                            \n                            divisors >> Length >> len.\n                            len >> check:\n                                is 0: true.\n                                else: false.\n                            ..\n                    ..\n            ..\n    ..\n..\n\n(1 & 50) >> Range >> all_nums.\nall_nums >> Filter:\n    @ >> IsPrime.\n.. >> primes.\n\n\"Primes up to 50: \" >> output.\n(primes >> ToJson) >+> output >> Display.\n"
    },
    "agent_5_math_quick_sort": {
        "name": "[Math] Quick Sort",
        "code": "// 4. quick_sort.pop\n// QuickSort implementation using functional filtering.\n\nnew QuickSort:\n    @ >> arr.\n    arr >> Length >> l.\n    l >> check:\n        is <= 1: arr.\n        else:\n            arr[0] >> pivot.\n            \n            arr >> Filter:\n                @ < pivot.\n            .. >> left.\n            \n            arr >> Filter:\n                @ == pivot.\n            .. >> mid.\n            \n            arr >> Filter:\n                @ > pivot.\n            .. >> right.\n            \n            left >> QuickSort >> sorted_left.\n            right >> QuickSort >> sorted_right.\n            \n            sorted_left >> result.\n            mid >!>:\n                @ >+> result.\n            ..\n            sorted_right >!>:\n                @ >+> result.\n            ..\n            \n            result.\n    ..\n..\n\n[38, 27, 43, 3, 9, 82, 10, 19, 50, 4] >> data.\n\"Original: \" >> out1.\n(data >> ToJson) >+> out1 >> Display.\n\ndata >> QuickSort >> sorted.\n\"Sorted: \" >> out2.\n(sorted >> ToJson) >+> out2 >> Display.\n"
    },
    "agent_5_math_sorting_algorithms": {
        "name": "[Math] Sorting Algorithms",
        "code": "// 4. sorting_algorithms.pop\n// Demonstrates sorting algorithms and data manipulation using Sort blocks.\n\n[\n    {\"name\": \"Alice\", \"score\": 85},\n    {\"name\": \"Bob\", \"score\": 92},\n    {\"name\": \"Charlie\", \"score\": 78},\n    {\"name\": \"Diana\", \"score\": 95},\n    {\"name\": \"Eve\", \"score\": 88}\n] >> students.\n\n\"Original Students: \" >> out1.\n(students >> ToJson) >+> out1 >> Display.\n\n// Sort by score ascending\nstudents >> Sort:\n    @[\"score\"].\n.. >> sorted_asc.\n\n\"Sorted by Score (Asc): \" >> out2.\n(sorted_asc >> ToJson) >+> out2 >> Display.\n\n// Sort by score descending (negative score)\nstudents >> Sort:\n    0 - @[\"score\"].\n.. >> sorted_desc.\n\n\"Sorted by Score (Desc): \" >> out3.\n(sorted_desc >> ToJson) >+> out3 >> Display.\n\n// Sort by name length\nstudents >> Sort:\n    @[\"name\"] >> Length.\n.. >> sorted_name_len.\n\n\"Sorted by Name Length: \" >> out4.\n(sorted_name_len >> ToJson) >+> out4 >> Display.\n"
    },
    "agent_5_math_standard_deviation": {
        "name": "[Math] Standard Deviation",
        "code": "// 1. standard_deviation.pop\n// Calculates mean, variance, and standard deviation of a dataset.\n\nnew Sqrt:\n    @ >> num.\n    num >> check:\n        is < 0: null.\n        is 0: 0.\n        else:\n            num / 2.0 >> guess.\n            (1 & 15) >> Range >> Map:\n                (guess + (num / guess)) / 2.0 >> guess.\n                guess.\n            ..\n            guess.\n    ..\n..\n\nnew Mean:\n    @ >> arr.\n    arr >> Length >> len.\n    len >> check:\n        is 0: 0.\n        else:\n            arr >> Reduce:\n                @[0] + @[1].\n            .. >> sum.\n            sum / len.\n    ..\n..\n\nnew StdDev:\n    @ >> arr.\n    arr >> Mean >> mean_val.\n    arr >> Length >> len.\n    \n    arr >> Map:\n        @ - mean_val >> diff.\n        diff * diff.\n    .. >> sq_diffs.\n    \n    sq_diffs >> Reduce:\n        @[0] + @[1].\n    .. >> sum_sq_diff.\n    \n    (sum_sq_diff / len) >> variance.\n    variance >> Sqrt.\n..\n\n[10.0, 12.0, 23.0, 23.0, 16.0, 23.0, 21.0, 16.0] >> data.\n\"Dataset: \" >+> (data >> ToJson) >> Display.\ndata >> StdDev >> std_dev.\n\"Standard Deviation: \" >+> (std_dev >> Str) >> Display.\n"
    },
    "agent_5_math_test": {
        "name": "[Math] Test",
        "code": "[1, 2, 3] >> arr.\narr >> Length >> l.\n\"len: \" >+> (l >> Str) >> Display.\n"
    },
    "agent_5_math_test2": {
        "name": "[Math] Test2",
        "code": "new QuickSort:\n    @ >> arr.\n    arr >> Length >> l.\n    l >> check:\n        is <= 1: arr.\n        else:\n            arr[0] >> pivot.\n            arr >> Filter:\n                @ < pivot.\n            .. >> left.\n            arr >> Filter:\n                @ == pivot.\n            .. >> mid.\n            arr >> Filter:\n                @ > pivot.\n            .. >> right.\n            \n            left >> QuickSort >> sorted_left.\n            right >> QuickSort >> sorted_right.\n            \n            [] >> result.\n            sorted_left >> Map:\n                @ >+> result.\n            ..\n            mid >> Map:\n                @ >+> result.\n            ..\n            sorted_right >> Map:\n                @ >+> result.\n            ..\n            result.\n    ..\n..\n\n[38, 27, 43, 3, 9, 82, 10, 19, 50, 4] >> QuickSort >> sorted.\n\"Sorted: \" >> out.\n(sorted >> ToJson) >+> out >> Display.\n"
    },
    "agent_5_math_test3": {
        "name": "[Math] Test3",
        "code": "new QuickSort:\n    @ >> arr.\n    arr >> Length >> l.\n    l >> check:\n        is <= 1: arr.\n        else:\n            arr[0] >> pivot.\n            arr >> Filter:\n                @ < pivot.\n            .. >> left.\n            arr >> Filter:\n                @ == pivot.\n            .. >> mid.\n            arr >> Filter:\n                @ > pivot.\n            .. >> right.\n            \n            left >> QuickSort >> sorted_left.\n            right >> QuickSort >> sorted_right.\n            \n            [] >> result.\n            sorted_left >> Map:\n                @ >+> result.\n            ..\n            mid >> Map:\n                @ >+> result.\n            ..\n            sorted_right >> Map:\n                @ >+> result.\n            ..\n            result.\n    ..\n..\n\n[38, 27, 43, 3, 9, 82, 10, 19, 50, 4] >> QuickSort >> sorted.\n\"Sorted: \" >> out.\n(sorted >> ToJson) >+> out >> Display.\n"
    },
    "agent_5_math_test_fact": {
        "name": "[Math] Test Fact",
        "code": "new Factorial:\n    @ >> n.\n    \"n is \" >+> (n >> Str) >> Display.\n    n >> check:\n        is <= 1: 1.\n        else:\n            n - 1 >> Factorial >> prev.\n            \"n is \" >+> (n >> Str) >+> \", prev is \" >+> (prev >> Str) >> Display.\n            n * prev.\n    ..\n..\n\n5 >> Factorial >> f5.\n\"5! = \" >> out1.\n(f5 >> Str) >+> out1 >> Display.\n"
    },
    "agent_6_physics_aoe_damage": {
        "name": "[Physics] Aoe Damage",
        "code": "new IsInRadius:\n    @ >> obj.\n    obj[\"x\"] * obj[\"x\"] >> dx2.\n    obj[\"y\"] * obj[\"y\"] >> dy2.\n    dx2 + dy2 >> dist2.\n    dist2 < 100 >> Return.\n..\n\nnew TakeDamage:\n    @ >> obj.\n    obj[\"hp\"] - 30 >> new_hp.\n    (obj & \"hp\" & new_hp) >> Set >> Return.\n..\n\n[\n    {\"id\": 1, \"x\": 5, \"y\": 5, \"hp\": 100},\n    {\"id\": 2, \"x\": 10, \"y\": 10, \"hp\": 100},\n    {\"id\": 3, \"x\": 0, \"y\": 8, \"hp\": 100}\n] >> targets.\n\ntargets >> Filter:\n    @ >> IsInRadius >> Return.\n.. >> hit_targets.\n\nhit_targets >> Map:\n    @ >> TakeDamage >> Return.\n.. >> hit_targets.\n\n\"Targets hit by AoE and took damage:\" >> Display.\nhit_targets >> Display.\n"
    },
    "agent_6_physics_damage_calc": {
        "name": "[Physics] Damage Calc",
        "code": "new CalcDamage:\n    @ >> args.\n    args[0] >> attacker.\n    args[1] >> defender.\n    \n    attacker[\"atk\"] - defender[\"def\"] >> dmg.\n    dmg >> check:\n        is < 1:\n            1 >> dmg.\n        else:\n            dmg >> dmg.\n    ..\n    defender[\"hp\"] - dmg >> new_hp.\n    (defender & \"hp\" & new_hp) >> Set.\n..\n\n{\"name\": \"Orc\", \"atk\": 25} >> enemy.\n{\"name\": \"Hero\", \"hp\": 100, \"def\": 10} >> player.\n\n(enemy & player) >> CalcDamage >> player.\n\nplayer >> Fork:\n    @[\"hp\"] >> Display.\n..\n"
    },
    "agent_6_physics_distance_filter": {
        "name": "[Physics] Distance Filter",
        "code": "new DistSquareFromOrigin:\n    @ >> p.\n    p[\"x\"] * p[\"x\"] >> dx2.\n    p[\"y\"] * p[\"y\"] >> dy2.\n    dx2 + dy2 >> Return.\n..\n\nnew IsFarEnough:\n    @ > 20 >> Return.\n..\n\n[\n    {\"id\": \"enemy1\", \"x\": 3, \"y\": 4},\n    {\"id\": \"enemy2\", \"x\": 10, \"y\": 10},\n    {\"id\": \"enemy3\", \"x\": 1, \"y\": 1}\n] >> enemies.\n\nenemies >> Map:\n    @ >> DistSquareFromOrigin >> Return.\n.. >> sq_distances.\n\n\"Squared distances of enemies from origin:\" >> Display.\nsq_distances >> Display.\n\nsq_distances >> Filter:\n    @ >> IsFarEnough >> Return.\n.. >> far_dists.\n\n\"Enemies far enough (sq_dist > 20):\" >> Display.\nfar_dists >> Display.\n"
    },
    "agent_6_physics_enemy_ai": {
        "name": "[Physics] Enemy Ai",
        "code": "new DecideAction:\n    @ >> enemy.\n    enemy[\"hp\"] >> check:\n        is < 20:\n            (enemy & \"action\" & \"Flee\") >> Set >> Return.\n        is > 80:\n            (enemy & \"action\" & \"Attack\") >> Set >> Return.\n        else:\n            (enemy & \"action\" & \"Defend\") >> Set >> Return.\n    ..\n..\n\n[\n    {\"id\": \"e1\", \"hp\": 10},\n    {\"id\": \"e2\", \"hp\": 50},\n    {\"id\": \"e3\", \"hp\": 90}\n] >> enemies.\n\nenemies >> Map:\n    @ >> DecideAction >> Return.\n.. >> enemies.\n\n\"Enemies actions:\" >> Display.\nenemies >> Display.\n"
    },
    "agent_6_physics_gravity_sim": {
        "name": "[Physics] Gravity Sim",
        "code": "new ApplyGravity:\n    @ >> obj.\n    obj[\"y\"] - 9 >> new_y.\n    new_y >> check:\n        is < 0:\n            0 >> new_y.\n        else:\n            new_y >> new_y.\n    ..\n    (obj & \"y\" & new_y) >> Set >> Return.\n..\n\n[\n    {\"id\": \"box1\", \"y\": 20},\n    {\"id\": \"box2\", \"y\": 5},\n    {\"id\": \"box3\", \"y\": 100}\n] >> objects.\n\n\"Initial states:\" >> Display.\nobjects >> Display.\n\nobjects >> Map:\n    @ >> ApplyGravity >> Return.\n.. >> objects.\n\n\"After 1 tick of gravity:\" >> Display.\nobjects >> Display.\n\nnew MaxHeight:\n    @ >> arr.\n    arr[0][\"y\"] >> y1.\n    arr[1][\"y\"] >> y2.\n    y1 >> check:\n        is > y2:\n            arr[0] >> Return.\n        else:\n            arr[1] >> Return.\n    ..\n..\n\nobjects >> Reduce:\n    @ >> MaxHeight >> Return.\n.. >> highest_obj.\n\n\"Highest object:\" >> Display.\nhighest_obj >> Display.\n"
    },
    "agent_6_physics_item_pickup": {
        "name": "[Physics] Item Pickup",
        "code": "new ApplyItem:\n    @ >> arr.\n    arr[0] >> player.\n    arr[1] >> item.\n    \n    item[\"type\"] >> check:\n        is \"potion\":\n            player[\"hp\"] + item[\"value\"] >> new_hp.\n            (player & \"hp\" & new_hp) >> Set >> Return.\n        is \"weapon\":\n            player[\"atk\"] + item[\"value\"] >> new_atk.\n            (player & \"atk\" & new_atk) >> Set >> Return.\n        else:\n            player >> Return.\n    ..\n..\n\n[\n    {\"hp\": 50, \"atk\": 10},\n    {\"type\": \"potion\", \"value\": 20},\n    {\"type\": \"weapon\", \"value\": 5},\n    {\"type\": \"junk\", \"value\": 0}\n] >> data.\n\ndata >> Reduce:\n    @ >> ApplyItem >> Return.\n.. >> final_player.\n\n\"Player after picking up items:\" >> Display.\nfinal_player >> Display.\n"
    },
    "agent_6_physics_party_health": {
        "name": "[Physics] Party Health",
        "code": "new HealChar:\n    @ >> char.\n    char[\"hp\"] + 50 >> new_hp.\n    new_hp >> check:\n        is > char[\"max_hp\"]:\n            char[\"max_hp\"] >> new_hp.\n        else:\n            new_hp >> new_hp.\n    ..\n    (char & \"hp\" & new_hp) >> Set >> Return.\n..\n\nnew IsDead:\n    @[\"hp\"] <= 0 >> Return.\n..\n\n[\n    {\"name\": \"Knight\", \"hp\": 10, \"max_hp\": 100},\n    {\"name\": \"Mage\", \"hp\": 0, \"max_hp\": 60},\n    {\"name\": \"Archer\", \"hp\": 40, \"max_hp\": 80}\n] >> party.\n\nparty >> Map:\n    @ >> HealChar >> Return.\n.. >> party.\n\n\"Party after healing:\" >> Display.\nparty >> Display.\n\nparty >> Filter:\n    @ >> IsDead >> Return.\n.. >> dead_members.\n\ndead_members >> Fork:\n    @ >> Length >> Display.\n    @ >> Display.\n..\n"
    },
    "agent_6_physics_projectile_path": {
        "name": "[Physics] Projectile Path",
        "code": "new CalcPos:\n    @ >> t.\n    10 * t >> x.\n    (20 * t) - (2 * t * t) >> y.\n    \n    {} >> pos.\n    (pos & \"x\" & x) >> Set >> pos.\n    (pos & \"y\" & y) >> Set >> Return.\n..\n\n(0 & 5) >> Range >> times.\n\ntimes >> Map:\n    @ >> CalcPos >> Return.\n.. >> path.\n\n\"Projectile Path over 5 seconds:\" >> Display.\npath >> Display.\n"
    },
    "agent_6_physics_safe_movement": {
        "name": "[Physics] Safe Movement",
        "code": "new MoveTo:\n    @ >> args.\n    args[0] >> pos.\n    args[1] >> target_x.\n    \n    target_x >> check:\n        is < 0:\n            (1 / 0) >> dummy.\n        is > 100:\n            (1 / 0) >> dummy.\n        else:\n            target_x >> new_x.\n    ..\n    (pos & \"x\" & target_x) >> Set.\n..\n\n{\"x\": 50, \"y\": 10} >> player.\n\n(player & -10) >> MoveTo >> catch:\n    @ >> err.\n    \"Movement Error! Out of bounds.\" >> Display.\n    player.\n.. >> player.\n\n\"Player position after invalid move:\" >> Display.\nplayer >> Display.\n\n(player & 80) >> MoveTo >> catch:\n    @ >> err.\n    \"Movement Error! Out of bounds.\" >> Display.\n    player.\n.. >> player.\n\n\"Player position after valid move:\" >> Display.\nplayer >> Display.\n"
    },
    "agent_6_physics_stat_manager": {
        "name": "[Physics] Stat Manager",
        "code": "new UpdateStat:\n    @ >> args.\n    args[0] >> char_stat.\n    args[1] >> event_type.\n    \n    event_type >> check:\n        is \"level_up\":\n            char_stat[\"hp\"] + 20 >> new_hp.\n            (char_stat & \"hp\" & new_hp) >> Set >> char_stat.\n            char_stat[\"atk\"] + 5 >> new_atk.\n            (char_stat & \"atk\" & new_atk) >> Set.\n        is \"damage\":\n            char_stat[\"hp\"] - 15 >> new_hp.\n            (char_stat & \"hp\" & new_hp) >> Set.\n        else:\n            char_stat.\n    ..\n..\n\n{\"name\": \"Hero\", \"hp\": 100, \"atk\": 15} >> hero.\n"
    },
    "agent_7_json_01_basic_parse": {
        "name": "[Json] 01 Basic Parse",
        "code": "// 01_basic_parse.pop\n\"{\\\"name\\\": \\\"Alice\\\", \\\"age\\\": 30}\" >> json_str.\njson_str >> FromJson >> parsed.\n\n(parsed & \"name\") >> Get >> name.\n(parsed & \"age\") >> Get >> age.\n\n(\"User Name: %s, Age: %s\" & name & age) >> Format >> msg.\nmsg >> Display.\n"
    },
    "agent_7_json_02_array_map": {
        "name": "[Json] 02 Array Map",
        "code": "// 02_array_map.pop\n\"[{\\\"id\\\": 1, \\\"status\\\": \\\"active\\\"}, {\\\"id\\\": 2, \\\"status\\\": \\\"inactive\\\"}]\" >> payload.\npayload >> FromJson >> arr.\n\narr >> Map:\n    (@ & \"status\") >> Get.\n.. >> statuses.\n\nstatuses >> ToJson >> statuses_json.\n\"Statuses: \" >+> statuses_json >> Display.\n"
    },
    "agent_7_json_03_nested_update": {
        "name": "[Json] 03 Nested Update",
        "code": "// 03_nested_update.pop\n\"{\\\"user\\\": {\\\"profile\\\": {\\\"theme\\\": \\\"dark\\\"}}}\" >> json_str.\njson_str >> FromJson >> root.\n\n(root & \"user\") >> Get >> user_dict.\n(user_dict & \"profile\") >> Get >> profile_dict.\n\n(profile_dict & \"theme\" & \"light\") >> Set >> updated_profile.\n(user_dict & \"profile\" & updated_profile) >> Set >> updated_user.\n(root & \"user\" & updated_user) >> Set >> updated_root.\n\nupdated_root >> ToJson >> Display.\n"
    },
    "agent_7_json_04_api_filter": {
        "name": "[Json] 04 Api Filter",
        "code": "// 04_api_filter.pop\n\"[{\\\"name\\\": \\\"A\\\", \\\"age\\\": 15}, {\\\"name\\\": \\\"B\\\", \\\"age\\\": 25}, {\\\"name\\\": \\\"C\\\", \\\"age\\\": 30}]\" >> json_str.\njson_str >> FromJson >> users.\n\nusers >> Filter:\n    (@ & \"age\") >> Get >> age.\n    age >= 20. // Returns boolean directly\n.. >> adults.\n\nadults >> ToJson >> Display.\n"
    },
    "agent_7_json_05_error_handling": {
        "name": "[Json] 05 Error Handling",
        "code": "// 05_error_handling.pop\n\"{\\\"broken_json: true\" >> invalid_json.\n\ninvalid_json >> FromJson >> catch:\n    @ >> err.\n    \"Failed to parse JSON: \" >+> err[\"message\"] >> Display.\n    {} // return empty dict implicitly\n.. >> result.\n\nresult >> ToJson >> Display.\n"
    },
    "agent_7_json_06_build_json": {
        "name": "[Json] 06 Build Json",
        "code": "// 06_build_json.pop\n{} >> base_dict.\n(base_dict & \"endpoint\" & \"/api/v1/users\") >> Set >> dict1.\n(dict1 & \"method\" & \"POST\") >> Set >> dict2.\n\n[\"Alice\", \"Bob\"] >> users.\n(dict2 & \"data\" & users) >> Set >> final_dict.\n\nfinal_dict >> ToJson >> Display.\n"
    },
    "agent_7_json_07_mock_handler": {
        "name": "[Json] 07 Mock Handler",
        "code": "// 07_mock_handler.pop\nnew MockApiHandler:\n    @ >> req_str.\n    req_str >> FromJson >> req.\n    \n    (req & \"action\") >> Get >> action.\n    action >> check:\n        is \"ping\":\n            {} >> resp.\n            (resp & \"status\" & \"pong\") >> Set.\n        else:\n            {} >> resp_err.\n            (resp_err & \"error\" & \"unknown action\") >> Set.\n    ..\n..\n\n\"{\\\"action\\\": \\\"ping\\\"}\" >> MockApiHandler >> ToJson >> Display.\n\"{\\\"action\\\": \\\"delete\\\"}\" >> MockApiHandler >> ToJson >> Display.\n"
    },
    "agent_7_json_08_reduce_json": {
        "name": "[Json] 08 Reduce Json",
        "code": "// 08_reduce_json.pop\n\"[{\\\"price\\\": 100}, {\\\"price\\\": 250}, {\\\"price\\\": 350}]\" >> cart_str.\ncart_str >> FromJson >> cart.\n\ncart >> Map:\n    (@ & \"price\") >> Get.\n.. >> prices.\n\nprices >> Reduce:\n    @ >> bundle.\n    bundle[0] >> total.\n    bundle[1] >> price.\n    (total & price) >> Add.\n.. >> total_price.\n\ntotal_price >> Str >> tp_str.\n\"Total Price: \" >> msg.\ntp_str >+> msg.\nmsg >> Display.\n"
    },
    "agent_7_json_09_transform_schema": {
        "name": "[Json] 09 Transform Schema",
        "code": "// 09_transform_schema.pop\n\"[{\\\"firstName\\\": \\\"John\\\", \\\"lastName\\\": \\\"Doe\\\", \\\"age\\\": 30}]\" >> input_str.\ninput_str >> FromJson >> input_arr.\n\ninput_arr >> Map:\n    @ >> old_user.\n    (old_user & \"firstName\") >> Get >> fn.\n    (old_user & \"lastName\") >> Get >> ln.\n    (old_user & \"age\") >> Get >> age.\n    \n    \"\" >> full_name.\n    fn >+> full_name.\n    \" \" >+> full_name.\n    ln >+> full_name.\n    \n    age >> check:\n        is >= 18: true.\n        else: false.\n    .. >> is_adult.\n    \n    {} >> new_user.\n    (new_user & \"fullName\" & full_name) >> Set >> u1.\n    (u1 & \"isAdult\" & is_adult) >> Set.\n.. >> new_arr.\n\nnew_arr >> ToJson >> Display.\n"
    },
    "agent_7_json_10_fork_json": {
        "name": "[Json] 10 Fork Json",
        "code": "// 10_fork_json.pop\n\"{\\\"metadata\\\": {\\\"count\\\": 2}, \\\"data\\\": [1, 2]}\" >> response_str.\nresponse_str >> FromJson >> response.\n\nnew ProcessMetadata:\n    (@ & \"metadata\") >> Get >> ToJson >> m_json.\n    \"Metadata: \" >> m_msg.\n    m_json >+> m_msg.\n    m_msg >> Display.\n..\n\nnew ProcessData:\n    (@ & \"data\") >> Get >> ToJson >> d_json.\n    \"Data: \" >> d_msg.\n    d_json >+> d_msg.\n    d_msg >> Display.\n..\n\nresponse >> Fork:\n    @ >> ProcessMetadata.\n    @ >> ProcessData.\n..\n"
    },
    "agent_8_ecommerce_script_01_total": {
        "name": "[Ecommerce] Script 01 Total",
        "code": "// script_01_total.pop\n[1500, 3200, 800, 450, 1200] >> prices.\n\"Calculating total for cart items...\" >> Display.\n\nprices >> Reduce @acc @item:\n    (@acc + @item) >> Return.\n.. >> total.\n\n([\"Total: \", (total >> Str)] & \"\") >> Join >> Display.\n"
    },
    "agent_8_ecommerce_script_02_filter_stock": {
        "name": "[Ecommerce] Script 02 Filter Stock",
        "code": "// script_02_filter_stock.pop\n[\n    {\"id\": 1, \"name\": \"Laptop\", \"stock\": 5},\n    {\"id\": 2, \"name\": \"Mouse\", \"stock\": 0},\n    {\"id\": 3, \"name\": \"Keyboard\", \"stock\": 2},\n    {\"id\": 4, \"name\": \"Monitor\", \"stock\": 0}\n] >> inventory.\n\n\"Filtering out-of-stock items...\" >> Display.\n\ninventory >> Filter:\n    @[\"stock\"] > 0 >> Return.\n.. >> available_items.\n\n\"Available items:\" >> Display.\navailable_items >> Map:\n    @[\"name\"] >> Display.\n    @ >> Return.\n.. >> discard.\n"
    },
    "agent_8_ecommerce_script_03_apply_discount": {
        "name": "[Ecommerce] Script 03 Apply Discount",
        "code": "// script_03_apply_discount.pop\n[\n    {\"name\": \"Shoes\", \"price\": 5000, \"category\": \"apparel\"},\n    {\"name\": \"Hat\", \"price\": 1500, \"category\": \"apparel\"},\n    {\"name\": \"Watch\", \"price\": 12000, \"category\": \"accessories\"}\n] >> cart.\n\ncart >> Map:\n    @ >> item.\n    item[\"category\"] >> check:\n        is \"apparel\":\n            (item[\"price\"] * 0.9) >> discounted_price.\n            (item & \"price\" & discounted_price) >> Set >> Return.\n        else:\n            item >> Return.\n    ..\n.. >> discounted_cart.\n\ndiscounted_cart >> Map:\n    @ >> it.\n    ([\"Item: \", it[\"name\"], \" - Price: \", (it[\"price\"] >> Str)] & \"\") >> Join >> Display.\n    it >> Return.\n.. >> discard.\n"
    },
    "agent_8_ecommerce_script_04_tax_calc": {
        "name": "[Ecommerce] Script 04 Tax Calc",
        "code": "// script_04_tax_calc.pop\n15000 >> subtotal.\n\"NY\" >> state.\n\nstate >> check:\n    is \"NY\":\n        0.08875 >> tax_rate.\n    is \"CA\":\n        0.0725 >> tax_rate.\n    else:\n        0.0 >> tax_rate.\n..\n\n(subtotal * tax_rate) >> tax_amount.\n(subtotal + tax_amount) >> total_with_tax.\n\n([\"Subtotal: \", (subtotal >> Str)] & \"\") >> Join >> Display.\n([\"Tax Rate: \", (tax_rate >> Str)] & \"\") >> Join >> Display.\n([\"Tax Amount: \", (tax_amount >> Str)] & \"\") >> Join >> Display.\n([\"Total with Tax: \", (total_with_tax >> Str)] & \"\") >> Join >> Display.\n"
    },
    "agent_8_ecommerce_script_05_checkout_fork": {
        "name": "[Ecommerce] Script 05 Checkout Fork",
        "code": "// script_05_checkout_fork.pop\n{\"user_id\": 101, \"total\": 4500, \"email\": \"customer@example.com\"} >> order.\n\n\"Starting checkout process...\" >> Display.\n\norder >> Fork:\n    @[\"total\"] >> amount.\n    ([\"Processing payment for amount: \", (amount >> Str)] & \"\") >> Join >> Display.\n    \n    @[\"user_id\"] >> uid.\n    ([\"Updating order history for user: \", (uid >> Str)] & \"\") >> Join >> Display.\n    \n    @[\"email\"] >> email.\n    ([\"Sending receipt to: \", email] & \"\") >> Join >> Display.\n.. >> results.\n\n\"Checkout complete.\" >> Display.\n"
    },
    "agent_8_ecommerce_script_06_error_handling": {
        "name": "[Ecommerce] Script 06 Error Handling",
        "code": "// script_06_error_handling.pop\n[\n    {\"name\": \"Table\", \"price\": 8000},\n    {\"name\": \"Chair\"} // missing price\n] >> cart.\n\ncart >> Map:\n    @ >> item.\n    item[\"price\"] >> price.\n    (price * 0.9) >> Return.\n.. >> catch:\n    @ >> err.\n    ([\"Error processing cart: \", err[\"message\"]] & \"\") >> Join >> Display.\n    [0, 0] >> Return.\n.. >> discounted_prices.\n\n\"Discounted Prices: \" >> Display.\ndiscounted_prices >> Display.\n"
    },
    "agent_8_ecommerce_script_07_receipt": {
        "name": "[Ecommerce] Script 07 Receipt",
        "code": "// script_07_receipt.pop\n[\n    {\"name\": \"Book\", \"price\": 1200},\n    {\"name\": \"Pen\", \"price\": 300},\n    {\"name\": \"Notebook\", \"price\": 500}\n] >> cart.\n\ncart >> Map:\n    @ >> item.\n    (item[\"price\"] >> Str) >> price_str.\n    ([\"- \", item[\"name\"], \": $\", price_str] & \"\") >> Join >> Return.\n.. >> receipt_lines.\n\n(receipt_lines & \"\\n\") >> Join >> body.\n([\"=== RECEIPT ===\", body, \"Thank you!\"] & \"\\n\") >> Join >> receipt.\nreceipt >> Display.\n"
    },
    "agent_8_ecommerce_script_08_shipping": {
        "name": "[Ecommerce] Script 08 Shipping",
        "code": "// script_08_shipping.pop\n[2000, 1500, 3000] >> prices.\n\nprices >> Reduce @a @b:\n    (@a + @b) >> Return.\n.. >> total.\n\ntotal >> check:\n    is > 5000:\n        0 >> shipping.\n    is > 2000:\n        500 >> shipping.\n    else:\n        1000 >> shipping.\n..\n\n(total + shipping) >> final_total.\n\n([\"Cart Total: \", (total >> Str)] & \"\") >> Join >> Display.\n([\"Shipping Fee: \", (shipping >> Str)] & \"\") >> Join >> Display.\n([\"Final Total: \", (final_total >> Str)] & \"\") >> Join >> Display.\n"
    },
    "agent_8_ecommerce_script_09_max_price": {
        "name": "[Ecommerce] Script 09 Max Price",
        "code": "// script_09_max_price.pop\n[\n    {\"name\": \"Phone\", \"price\": 80000},\n    {\"name\": \"Case\", \"price\": 2000},\n    {\"name\": \"Headphones\", \"price\": 15000}\n] >> cart.\n\ncart >> Reduce @a @b:\n    @a[\"price\"] >> price_a.\n    @b[\"price\"] >> price_b.\n    \n    price_a >> check:\n        is > price_b:\n            @a >> Return.\n        else:\n            @b >> Return.\n    ..\n.. >> most_expensive.\n\n([\"Most expensive item is: \", most_expensive[\"name\"]] & \"\") >> Join >> Display.\n([\"Price: \", (most_expensive[\"price\"] >> Str)] & \"\") >> Join >> Display.\n"
    },
    "agent_8_ecommerce_test_catch": {
        "name": "[Ecommerce] Test Catch",
        "code": "// test_catch.pop\n[1] >> Map:\n    @[\"missing\"] >> Return.\n.. >> catch:\n    \"Error: \" >+> @[\"message\"] >> Display.\n..\n"
    },
    "agent_8_ecommerce_test_check": {
        "name": "[Ecommerce] Test Check",
        "code": "// test_check.pop\n100 >> check:\n    is > 50: \"Greater than 50\" >> Display.\n    else: \"Less or equal 50\" >> Display.\n..\n"
    },
    "agent_8_ecommerce_test_fork": {
        "name": "[Ecommerce] Test Fork",
        "code": "// test_fork.pop\n100 >> fork:\n    -> \"Branch 1: \" >+> (@ >> Str) >> Display.\n    -> \"Branch 2: \" >+> (@ >> Str) >> Display.\n..\n"
    },
    "agent_8_ecommerce_test_fork2": {
        "name": "[Ecommerce] Test Fork2",
        "code": "// test_fork2.pop\n100 >> fork:\n    route \"Branch 1: \" >+> (@ >> Str) >> Display.\n    route \"Branch 2: \" >+> (@ >> Str) >> Display.\n..\n"
    },
    "agent_8_ecommerce_test_fork3": {
        "name": "[Ecommerce] Test Fork3",
        "code": "// test_fork3.pop\n100 >> fork:\n    \"Branch 1: \" >+> (@ >> Str) >> Display.\n    \"Branch 2: \" >+> (@ >> Str) >> Display.\n.. >> results.\nresults >> Display.\n"
    },
    "agent_8_ecommerce_test_fork4": {
        "name": "[Ecommerce] Test Fork4",
        "code": "// test_fork4.pop\n100 >> Fork:\n    \"Branch 1: \" >+> (@ >> Str) >> Display.\n    \"Branch 2: \" >+> (@ >> Str) >> Display.\n.. >> results.\nresults >> Display.\n"
    },
    "agent_8_ecommerce_test_loop": {
        "name": "[Ecommerce] Test Loop",
        "code": "// test_loop.pop\n0 >> total.\n[1, 2, 3] >> loop:\n    item.\n    (total & item) >> Add >> total.\n..\ntotal >> Display.\n"
    },
    "agent_8_ecommerce_test_map": {
        "name": "[Ecommerce] Test Map",
        "code": "// test_map.pop\n[1, 2, 3] >> Map:\n    @ * 2 >> Return.\n.. >> doubled.\ndoubled >> Display.\n\n[1, 2, 3, 4] >> Filter:\n    @ % 2 == 0 >> Return.\n.. >> evens.\nevens >> Display.\n\n[1, 2, 3] >> Reduce:\n    (@acc + @item) >> Return.\n.. >> sum.\nsum >> Display.\n"
    },
    "agent_8_ecommerce_test_ops": {
        "name": "[Ecommerce] Test Ops",
        "code": "// test_ops.pop\n[1, 2, 3] >~> Str >> map_res.\n[1, 2, 3] >-> Bool >> filter_res.\n"
    },
    "agent_8_ecommerce_test_reduce": {
        "name": "[Ecommerce] Test Reduce",
        "code": "// test_reduce.pop\n[10, 20, 30] >> Reduce @a @b:\n    (@a + @b) >> Return.\n.. >> sum2.\nsum2 >> Display.\n"
    },
    "agent_9_cli_games_10_coin_streak": {
        "name": "[Cli Games] 10 Coin Streak",
        "code": "\"Coin Flip Streak!\" >> Display.\n{\"0\": \"heads\", \"1\": \"tails\"} >> sides.\n0 >> streak.\n\nnew FlipLoop:\n    (0 & 1) >> Random >> Str >> coin_idx.\n    (sides & coin_idx) >> Get >> coin.\n    \n    \"Guess heads or tails (or 'quit'): \" >> Input >> guess.\n    guess >> check:\n        is \"quit\":\n            (\"Final streak: %s\" & streak) >> Format >> Display.\n            Return.\n        is coin:\n            \"Correct!\" >> Display.\n            (streak & 1) >> Add >> streak.\n            (\"Current streak: %s\" & streak) >> Format >> Display.\n            null >> FlipLoop.\n        else:\n            (\"Wrong! It was %s\" & coin) >> Format >> Display.\n            (\"Streak ended at: %s\" & streak) >> Format >> Display.\n            0 >> streak.\n            null >> FlipLoop.\n    ..\n..\n\nnull >> FlipLoop.\n"
    },
    "agent_9_cli_games_1_number_guessing": {
        "name": "[Cli Games] 1 Number Guessing",
        "code": "\"Welcome to the Number Guessing Game!\" >> Display.\n(1 & 100) >> Random >> target.\n\nnew GameLoop:\n    \"Guess a number between 1 and 100: \" >> Input >> Int >> guess.\n    guess >> check:\n        is target:\n            \"Congratulations! You guessed it!\" >> Display.\n        is < target:\n            \"Too low! Try again.\" >> Display.\n            null >> GameLoop.\n        is > target:\n            \"Too high! Try again.\" >> Display.\n            null >> GameLoop.\n    ..\n..\n\nnull >> GameLoop.\n"
    },
    "agent_9_cli_games_2_rock_paper_scissors": {
        "name": "[Cli Games] 2 Rock Paper Scissors",
        "code": "\"Rock Paper Scissors!\" >> Display.\n{\"0\": \"rock\", \"1\": \"paper\", \"2\": \"scissors\"} >> choices.\n\nnew PlayRound:\n    (0 & 2) >> Random >> Str >> bot_idx.\n    (choices & bot_idx) >> Get >> bot_choice.\n    \"Enter rock, paper, or scissors (or quit): \" >> Input >> user_choice.\n    user_choice >> check:\n        is \"quit\":\n            \"Bye!\" >> Display.\n        else:\n            (\"Bot chose %s\" & bot_choice) >> Format >> Display.\n            user_choice >> check:\n                is bot_choice:\n                    \"Tie!\" >> Display.\n                    null >> PlayRound.\n                is \"rock\":\n                    bot_choice >> check:\n                        is \"scissors\": \"You win!\" >> Display.\n                        else: \"You lose!\" >> Display.\n                    ..\n                    null >> PlayRound.\n                is \"paper\":\n                    bot_choice >> check:\n                        is \"rock\": \"You win!\" >> Display.\n                        else: \"You lose!\" >> Display.\n                    ..\n                    null >> PlayRound.\n                is \"scissors\":\n                    bot_choice >> check:\n                        is \"paper\": \"You win!\" >> Display.\n                        else: \"You lose!\" >> Display.\n                    ..\n                    null >> PlayRound.\n                else:\n                    \"Invalid input!\" >> Display.\n                    null >> PlayRound.\n            ..\n    ..\n..\n\nnull >> PlayRound.\n"
    },
    "agent_9_cli_games_3_math_quiz": {
        "name": "[Cli Games] 3 Math Quiz",
        "code": "\"Math Quiz!\" >> Display.\n0 >> score.\n\nnew Question:\n    (1 & 20) >> Random >> a.\n    (1 & 20) >> Random >> b.\n    (a & b) >> Add >> ans.\n    (\"What is %s + %s? (or 0 to quit): \" & a & b) >> Format >> Input >> Int >> guess.\n    guess >> check:\n        is 0:\n            (\"Game over. Score: %s\" & score) >> Format >> Display.\n        is == ans:\n            \"Correct!\" >> Display.\n            (score & 1) >> Add >> score.\n            null >> Question.\n        else:\n            \"Wrong!\" >> Display.\n            null >> Question.\n    ..\n..\n\nnull >> Question.\n"
    },
    "agent_9_cli_games_4_word_guesser": {
        "name": "[Cli Games] 4 Word Guesser",
        "code": "\"Word Guesser!\" >> Display.\n\"poppop\" >> target.\n\"\" >> guessed.\n\nnew Loop:\n    \"Guess a letter (or 'quit'): \" >> Input >> guess.\n    guess >> check:\n        is \"quit\":\n            \"Bye!\" >> Display.\n        else:\n            guess >+> guessed.\n            \"You guessed: {guessed}\" >> Display.\n            null >> Loop.\n    ..\n..\n\nnull >> Loop.\n"
    },
    "agent_9_cli_games_5_dice_simulator": {
        "name": "[Cli Games] 5 Dice Simulator",
        "code": "\"Dice Roller!\" >> Display.\n\nnew Roll:\n    \"Press Enter to roll (or type 'quit'): \" >> Input >> cmd.\n    cmd >> check:\n        is \"quit\":\n            \"Bye!\" >> Display.\n        else:\n            (1 & 6) >> Random >> d1.\n            (1 & 6) >> Random >> d2.\n            (d1 & d2) >> Add >> total.\n            (\"You rolled %s and %s (Total: %s)\" & d1 & d2 & total) >> Format >> Display.\n            null >> Roll.\n    ..\n..\n\nnull >> Roll.\n"
    },
    "agent_9_cli_games_6_trivia": {
        "name": "[Cli Games] 6 Trivia",
        "code": "\"Trivia Quiz!\" >> Display.\n\n0 >> score.\n\nnew Q1:\n    \"1. What is 5 * 5?\\nAnswer (or quit): \" >> Input >> a1.\n    a1 >> check:\n        is \"quit\": Return.\n        is \"25\": \n            \"Correct!\" >> Display.\n            (score & 1) >> Add >> score.\n        else:\n            \"Wrong!\" >> Display.\n    ..\n    null >> Q2.\n..\n\nnew Q2:\n    \"2. Capital of France?\\nAnswer (or quit): \" >> Input >> a2.\n    a2 >> check:\n        is \"quit\": Return.\n        is \"Paris\": \n            \"Correct!\" >> Display.\n            (score & 1) >> Add >> score.\n        else:\n            \"Wrong!\" >> Display.\n    ..\n    null >> End.\n..\n\nnew End:\n    (\"Final score: %s\" & score) >> Format >> Display.\n..\n\nnull >> Q1.\n"
    },
    "agent_9_cli_games_7_speed_math": {
        "name": "[Cli Games] 7 Speed Math",
        "code": "\"Speed Math!\" >> Display.\n\nnew Play:\n    (10 & 99) >> Random >> x.\n    (10 & 99) >> Random >> y.\n    (x & y) >> Add >> target.\n    \n    (\"Quick! %s + %s = ?\" & x & y) >> Format >> Input >> Int >> ans.\n    ans >> check:\n        is target:\n            \"Great job!\" >> Display.\n            null >> Play.\n        else:\n            (\"Wrong, it was %s\" & target) >> Format >> Display.\n            \"Play again? (y/n): \" >> Input >> play_again.\n            play_again >> check:\n                is \"y\": null >> Play.\n                else: \"Bye!\" >> Display.\n            ..\n    ..\n..\n\nnull >> Play.\n"
    },
    "agent_9_cli_games_8_treasure_hunt": {
        "name": "[Cli Games] 8 Treasure Hunt",
        "code": "\"Treasure Hunt!\" >> Display.\n(1 & 5) >> Random >> tx.\n(1 & 5) >> Random >> ty.\n\nnew Hunt:\n    \"Enter X coordinate (1-5, or 0 to quit): \" >> Input >> Int >> gx.\n    gx >> check:\n        is 0: Return.\n    ..\n    \"Enter Y coordinate (1-5): \" >> Input >> Int >> gy.\n    \n    gx >> check:\n        is == tx:\n            gy >> check:\n                is == ty:\n                    \"You found the treasure!\" >> Display.\n                    Return.\n                else:\n                    \"Wrong Y!\" >> Display.\n            ..\n        else:\n            \"Wrong X!\" >> Display.\n    ..\n    null >> Hunt.\n..\n\nnull >> Hunt.\n"
    },
    "agent_9_cli_games_9_blackjack": {
        "name": "[Cli Games] 9 Blackjack",
        "code": "\"Simple Blackjack!\" >> Display.\n\nnew Draw:\n    (1 & 11) >> Random >> Return.\n..\n\nnew Play:\n    null >> Draw >> card1.\n    null >> Draw >> card2.\n    (card1 & card2) >> Add >> total.\n    \n    (\"Your cards: %s, %s. Total: %s\" & card1 & card2 & total) >> Format >> Display.\n    \"Hit (h) or Stand (s)? \" >> Input >> choice.\n    \n    choice >> check:\n        is \"h\":\n            null >> Draw >> card3.\n            (total & card3) >> Add >> total.\n            (\"You drew %s. Total: %s\" & card3 & total) >> Format >> Display.\n            total >> check:\n                is > 21: \"Bust! You lose.\" >> Display.\n                else: \"Game over (simplified).\" >> Display.\n            ..\n        is \"s\":\n            \"You stood.\" >> Display.\n    ..\n..\n\nnull >> Play.\n"
    }
};
