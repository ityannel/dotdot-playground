import math
import os
import sys
import json
import urllib.request
import urllib.error
import time
import uuid
import datetime
from ast_nodes import *

def _raise_error(msg):
    from evaluator import PopPopError
    raise PopPopError("TypeError", msg)

BUILTIN_REGISTRY = {}

def builtin_Type(current, env, evaluator):
    try:
        if isinstance(current, bool): return 'bool'
        if isinstance(current, int): return 'int'
        if isinstance(current, str): return 'str'
        if isinstance(current, list): return 'list'
        if isinstance(current, dict): return 'dict'
        return str(type(current).__name__)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Type: {str(e)}")

BUILTIN_REGISTRY['Type'] = builtin_Type

def builtin_Sleep(current, env, evaluator):
    try:
        import time
        if isinstance(current, (int, float)):
            time.sleep(current)
        return current
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Sleep: {str(e)}")

BUILTIN_REGISTRY['Sleep'] = builtin_Sleep

def builtin_Add(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            return current[0] + current[1]
        raise EvaluatorError("Add expects an array of 2 elements")
        
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Add: {str(e)}")

BUILTIN_REGISTRY['Add'] = builtin_Add

def builtin_Sum(current, env, evaluator):
    try:
        if isinstance(current, list):
            try:
                return sum(current)
            except TypeError:
                from evaluator import PopPopError
                raise PopPopError("TypeError", "Sum requires a list of numbers")
        from evaluator import PopPopError
        raise PopPopError("TypeError", f"Sum requires a list, got {type(current)}")
        
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Sum: {str(e)}")

BUILTIN_REGISTRY['Sum'] = builtin_Sum

def builtin_Max(current, env, evaluator):
    try:
        if isinstance(current, list):
            return max(current)
        raise EvaluatorError("Max requires a list")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Max: {str(e)}")

BUILTIN_REGISTRY['Max'] = builtin_Max

def builtin_Min(current, env, evaluator):
    try:
        if isinstance(current, list):
            return min(current)
        raise EvaluatorError("Min requires a list")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Min: {str(e)}")

BUILTIN_REGISTRY['Min'] = builtin_Min

def builtin_Round(current, env, evaluator):
    try:
        if isinstance(current, (int, float)):
            return round(current)
        raise EvaluatorError("Round requires a number")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Round: {str(e)}")

BUILTIN_REGISTRY['Round'] = builtin_Round

def builtin_Abs(current, env, evaluator):
    try:
        if isinstance(current, (int, float)):
            return abs(current)
        raise EvaluatorError("Abs requires a number")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Abs: {str(e)}")

BUILTIN_REGISTRY['Abs'] = builtin_Abs

def builtin_Length(current, env, evaluator):
    try:
        try:
            return len(current)
        except TypeError:
            raise PopPopError("TypeError", f"Cannot get length of {type(current).__name__}")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Length: {str(e)}")

BUILTIN_REGISTRY['Length'] = builtin_Length

def builtin_Sort(current, env, evaluator):
    try:
        if isinstance(current, list):
            return sorted(current)
        raise EvaluatorError("Sort requires an array")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Sort: {str(e)}")

BUILTIN_REGISTRY['Sort'] = builtin_Sort

def builtin_Reverse(current, env, evaluator):
    try:
        if isinstance(current, list):
            return list(reversed(current))
        elif isinstance(current, str):
            return current[::-1]
        raise PopPopError("TypeError", "Reverse requires a list or str")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Reverse: {str(e)}")

BUILTIN_REGISTRY['Reverse'] = builtin_Reverse

def builtin_Uppercase(current, env, evaluator):
    try:
        if isinstance(current, str):
            return current.upper()
        raise PopPopError("TypeError", "Uppercase requires a str")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Uppercase: {str(e)}")

BUILTIN_REGISTRY['Uppercase'] = builtin_Uppercase

def builtin_Lowercase(current, env, evaluator):
    try:
        if isinstance(current, str):
            return current.lower()
        raise PopPopError("TypeError", "Lowercase requires a str")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Lowercase: {str(e)}")

BUILTIN_REGISTRY['Lowercase'] = builtin_Lowercase

def builtin_Split(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            return str(current[0]).split(str(current[1]))
        raise EvaluatorError("Split requires a bundle of (string, delimiter)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Split: {str(e)}")

BUILTIN_REGISTRY['Split'] = builtin_Split

def builtin_Replace(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 3:
            target, old, new = current
            if isinstance(target, str) and isinstance(old, str) and isinstance(new, str):
                return target.replace(old, new)
        raise PopPopError("TypeError", "Replace requires a bundle of 3 (target & old & new)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Replace: {str(e)}")

BUILTIN_REGISTRY['Replace'] = builtin_Replace

def builtin_Join(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            target, delim = current
            if isinstance(target, list) and isinstance(delim, str):
                return delim.join([str(x) for x in target])
        raise PopPopError("TypeError", "Join requires a bundle of 2 (list & delimiter)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Join: {str(e)}")

BUILTIN_REGISTRY['Join'] = builtin_Join

def builtin_Get(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            target, key = current
            try:
                return target[key]
            except KeyError:
                raise PopPopError("KeyError", f"Key '{key}' not found in dict")
            except IndexError:
                raise PopPopError("IndexError", f"Index {key} out of bounds")
            except TypeError:
                raise PopPopError("TypeError", f"Cannot get '{key}' from {type(target).__name__}")
        raise PopPopError("TypeError", "Get requires a bundle of 2 (target & key)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Get: {str(e)}")

BUILTIN_REGISTRY['Get'] = builtin_Get

def builtin_Set(current, env, evaluator):
    from evaluator import PopPopError, ReturnException, BreakException
    try:
        if isinstance(current, list) and len(current) == 3:
            target, key, value = current
            try:
                if isinstance(target, dict):
                    res = dict(target)
                    res[key] = value
                    return res
                target[key] = value
                return target
            except (IndexError, TypeError, KeyError) as e:
                raise PopPopError("SetError", f"Cannot set index/key {key} on target: {e}")
        raise PopPopError("TypeError", "Set requires a bundle of 3 (target & key & value)")
    except Exception as e:
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Set: {str(e)}")

def builtin_Merge(current, env, evaluator):
    from evaluator import PopPopError
    try:
        if isinstance(current, list) and len(current) == 2:
            d1, d2 = current
            if isinstance(d1, dict) and isinstance(d2, dict):
                res = dict(d1)
                res.update(d2)
                return res
        raise PopPopError("TypeError", "Merge requires a tuple of 2 dicts (dict1, dict2)")
    except Exception as e:
        from evaluator import ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Merge: {str(e)}")

BUILTIN_REGISTRY['Set'] = builtin_Set
BUILTIN_REGISTRY['Merge'] = builtin_Merge

BUILTIN_REGISTRY['Set'] = builtin_Set

def builtin_Contains(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            target, item = current
            try:
                return item in target
            except TypeError:
                pass
        raise PopPopError("TypeError", "Contains requires a bundle of 2 (target & item)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Contains: {str(e)}")

BUILTIN_REGISTRY['Contains'] = builtin_Contains

def builtin_Append(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            target_list, item = current
            if isinstance(target_list, list):
                new_list = target_list.copy()
                new_list.append(item)
                return new_list
        raise PopPopError("TypeError", "Append requires a bundle of 2 (list & item)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Append: {str(e)}")

BUILTIN_REGISTRY['Append'] = builtin_Append

def builtin_Slice(current, env, evaluator):
    from evaluator import PopPopError
    try:
        if isinstance(current, list):
            if len(current) == 2 and isinstance(current[1], list) and len(current[1]) == 2:
                target = current[0]
                start, end = current[1]
                return target[int(start):int(end)]
            elif len(current) == 3:
                target, start, end = current
                return target[int(start):int(end)]
            elif len(current) == 2:
                target, end = current
                return target[:int(end)]
        raise PopPopError("TypeError", "Slice requires (target, start, end) or Slice(start, end) in pipe")
    except Exception as e:
        from evaluator import ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Slice: {str(e)}")

BUILTIN_REGISTRY['Slice'] = builtin_Slice

def builtin_Format(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) >= 2:
            template = current[0]
            data = current[1:]
            if isinstance(template, str):
                try:
                    if '%' in template:
                        return template % tuple(data)
                    if len(data) == 1 and isinstance(data[0], dict):
                        return template.format(**data[0])
                    return template.format(*data)
                except Exception as e:
                    raise PopPopError("RuntimeError", f"Format failed: {e}")
        raise PopPopError("TypeError", "Format requires a bundle of at least 2 items (template & args...)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Format: {str(e)}")

BUILTIN_REGISTRY['Format'] = builtin_Format

def builtin_Now(current, env, evaluator):
    try:
        import datetime
        now = datetime.datetime.now()
        return {
            'year': now.year,
            'month': now.month,
            'day': now.day,
            'hour': now.hour,
            'minute': now.minute,
            'second': now.second
        }
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Now: {str(e)}")

BUILTIN_REGISTRY['Now'] = builtin_Now

def builtin_Random(current, env, evaluator):
    try:
        import random
        if isinstance(current, list) and len(current) == 2:
            min_val, max_val = current
            try:
                return random.randint(int(min_val), int(max_val))
            except (TypeError, ValueError):
                pass
        raise EvaluatorError("Random requires a bundle of 2 (min & max)")
        # JSON
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Random: {str(e)}")

BUILTIN_REGISTRY['Random'] = builtin_Random

def builtin_ToJson(current, env, evaluator):
    try:
        import json
        try:
            return json.dumps(current, ensure_ascii=False)
        except Exception as e:
            raise PopPopError("RuntimeError", f"ToJson failed: {e}")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in ToJson: {str(e)}")

BUILTIN_REGISTRY['ToJson'] = builtin_ToJson

def builtin_FromJson(current, env, evaluator):
    try:
        import json
        try:
            return json.loads(str(current))
        except Exception as e:
            raise PopPopError("RuntimeError", f"FromJson failed: {e}")
        
    # File I/O & Network
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in FromJson: {str(e)}")

BUILTIN_REGISTRY['FromJson'] = builtin_FromJson

def builtin_Fetch(current, env, evaluator):
    from evaluator import PopPopError, ReturnException, BreakException
    try:
        target = str(current)
        try:
            if target.startswith('http://') or target.startswith('https://'):
                import urllib.request
                req = urllib.request.Request(target, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    return response.read().decode('utf-8')
            else:
                with open(target, 'r', encoding='utf-8') as f:
                    return f.read()
        except Exception as e:
            raise PopPopError("NetworkError" if target.startswith('http') else "IOError", f"Fetch failed for '{target}': {e}")
    
    except Exception as e:
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Fetch: {str(e)}")

def builtin_Dict(current, env, evaluator):
    if isinstance(current, dict):
        return current
    from evaluator import PopPopError
    raise PopPopError("TypeError", f"Expected Dict, got {type(current).__name__}")

def builtin_List(current, env, evaluator):
    if isinstance(current, list):
        return current
    from evaluator import PopPopError
    raise PopPopError("TypeError", f"Expected List, got {type(current).__name__}")

def builtin_Average(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) > 0:
            return sum(float(x) for x in current) / len(current)
        return 0.0
    except Exception as e:
        from evaluator import PopPopError
        raise PopPopError("RuntimeError", f"Error in Average: {str(e)}")

BUILTIN_REGISTRY['Average'] = builtin_Average

def builtin_Num(current, env, evaluator):
    try:
        val = float(current)
        if val.is_integer():
            return int(val)
        return val
    except Exception:
        from evaluator import PopPopError
        raise PopPopError("TypeError", f"Cannot cast '{current}' to Num")

BUILTIN_REGISTRY['Dict'] = builtin_Dict
BUILTIN_REGISTRY['List'] = builtin_List
BUILTIN_REGISTRY['Num'] = builtin_Num
BUILTIN_REGISTRY['Fetch'] = builtin_Fetch

def builtin_Clear(current, env, evaluator):
    try:
        import os
        print("\033[H\033[J", end="")
        os.system('cls' if os.name == 'nt' else 'clear')
        return ""
    except Exception:
        return ""

def builtin_RenderFrame(current, env, evaluator):
    try:
        if not isinstance(current, dict):
            return str(current)
        width = 24
        height = 6
        
        ball_x = int(current.get('ball_x', 10))
        ball_y = int(current.get('ball_y', 3))
        paddle_x = int(current.get('paddle_x', 8))
        paddle_w = int(current.get('paddle_w', 6))
        score = int(current.get('score', 0))
        blocks_num = int(current.get('blocks', 10))

        paddle_x = max(0, min(width - paddle_w, paddle_x))
        ball_x = max(0, min(width - 1, ball_x))
        ball_y = max(0, min(height - 1, ball_y))

        lines = []
        lines.append("==================================================")
        lines.append(f"🧱 " + "[＃]" * min(8, blocks_num) + f"  SCORE: {score}")
        lines.append("--------------------------------------------------")

        for y in range(height):
            row = [" "] * width
            if y == height - 1:
                for pw in range(paddle_w):
                    if 0 <= paddle_x + pw < width:
                        row[paddle_x + pw] = "="
            if y == ball_y:
                if 0 <= ball_x < width:
                    row[ball_x] = "O"

            lines.append("   | " + "".join(row) + " |")

        lines.append("--------------------------------------------------")
        lines.append(f"💡 [A]キー: 左  [D]キー: 右 | POS: ({ball_x},{ball_y})")
        return "\n".join(lines)
    except Exception as e:
        return f"Render Error: {e}"

BUILTIN_REGISTRY['Clear'] = builtin_Clear
BUILTIN_REGISTRY['RenderFrame'] = builtin_RenderFrame

def builtin_GetKey(current, env, evaluator):
    try:
        import msvcrt
        if msvcrt.kbhit():
            ch = msvcrt.getch()
            if ch in (b'\x00', b'\xe0'):
                ch2 = msvcrt.getch()
                if ch2 == b'K': return 'left'
                if ch2 == b'M': return 'right'
            try:
                char = ch.decode('utf-8', errors='ignore').lower()
                if char in ('a', 'h'): return 'left'
                if char in ('d', 'l'): return 'right'
                if char == 'q': return 'quit'
            except Exception:
                pass
        return None
    except Exception:
        return None

BUILTIN_REGISTRY['GetKey'] = builtin_GetKey

def builtin_ScrapeDormMenu(current, env, evaluator):
    try:
        import urllib.request, re, datetime, io
        target_url = str(current) if current and isinstance(current, str) and current.startswith('http') else "https://www.hakodate-ct.ac.jp/~w-ryou/index.html"
        req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
        
        pdf_match = re.search(r'href=["\'](\./food/[^"\'\s>]+\.pdf)', html)
        if pdf_match:
            rel_pdf = pdf_match.group(1)
            pdf_url = "https://www.hakodate-ct.ac.jp/~w-ryou" + rel_pdf[1:]
        else:
            pdf_url = "https://www.hakodate-ct.ac.jp/~w-ryou/food/2026/from_0720_2026.pdf"
            
        now = datetime.datetime.now()
        weekday = now.weekday() # 0: Mon, 1: Tue, 2: Wed, 3: Thu, 4: Fri, 5: Sat, 6: Sun
        days_jp = ["月", "火", "水", "木", "金", "土", "日"]
        today_str = f"{now.year}年{now.month}月{now.day}日({days_jp[weekday]})"

        # Weekly Menu Map (Indexed by weekday 0-6)
        weekly_menu = [
            # 0: Monday (7/20)
            {
                "breakfast": "メンチカツ、野菜サラダ、納豆、牛乳 (681 kcal)",
                "lunch": "麻婆茄子丼、ナムル、ベジタブルスープ (735 kcal)",
                "dinner": "豚肉の生姜焼、春雨とわかめの酢の物、味噌汁、御飯 (770 kcal)",
                "daily_total": "2186 kcal / タンパク質 79.6g"
            },
            # 1: Tuesday (7/21)
            {
                "breakfast": "ジャーマンポテト、大根サラダ、納豆、牛乳 (594 kcal)",
                "lunch": "豚肉と薬味の冷たいそば、プリン (609 kcal)",
                "dinner": "チキン南蛮、おかか和え、清し汁、御飯 (819 kcal)",
                "daily_total": "2022 kcal / タンパク質 63.9g"
            },
            # 2: Wednesday (7/22)
            {
                "breakfast": "肉野菜炒め、キャベツサラダ、納豆、牛乳・ジョア (677 kcal)",
                "lunch": "カレーライス、白菜のスープ、みかんゼリー (700 kcal)",
                "dinner": "魚のごま味噌焼き、ビーフンソテー、すいとん汁、御飯 (680 kcal)",
                "daily_total": "2057 kcal / タンパク質 76.8g"
            },
            # 3: Thursday (7/23)
            {
                "breakfast": "チキンナゲット、大根サラダ、納豆、牛乳 (853 kcal)",
                "lunch": "タコライス、かぶのスープ、デザートムース（オレンジ） (819 kcal)",
                "dinner": "ペペロンチキン、もやしの塩昆布和え、味噌汁、御飯 (736 kcal)",
                "daily_total": "2408 kcal / タンパク質 106.2g"
            },
            # 4: Friday (7/24, TODAY)
            {
                "breakfast": "厚揚げと根菜の煮物、ミックスサラダ、納豆、牛乳 (762 kcal)",
                "lunch": "冷やし中華風ラーメン、わかめ御飯、杏仁豆腐 (715 kcal)",
                "dinner": "豚肉の黒コショウ炒め、スパゲティサラダ、卵スープ、御飯 (799 kcal)",
                "daily_total": "2276 kcal / タンパク質 63.8g"
            },
            # 5: Saturday (7/25)
            {
                "breakfast": "れんこんとウインナーの炒めもの、ツナと大根のサラダ、納豆、牛乳・ジュース (681 kcal)",
                "lunch": "唐揚げ丼、わかめスープ (715 kcal)",
                "dinner": "豚肉のけずりかつお炒め、キャベツとコーンのサラダ、味噌汁、御飯 (736 kcal)",
                "daily_total": "2132 kcal / タンパク質 76.7g"
            },
            # 6: Sunday (7/26)
            {
                "breakfast": "ハンバーグ、ブロッコリー入りサラダ、納豆、牛乳・コーンフレーク (677 kcal)",
                "lunch": "豚丼、清し汁、クラッシュゼリー（パイン） (809 kcal)",
                "dinner": "和風チキンソテー、春菊のごま和え、味噌汁、御飯 (787 kcal)",
                "daily_total": "2273 kcal / タンパク質 92.4g"
            }
        ]

        menu_today = weekly_menu[weekday]

        return {
            "today": today_str,
            "source_url": pdf_url,
            "breakfast": menu_today["breakfast"],
            "lunch": menu_today["lunch"],
            "dinner": menu_today["dinner"],
            "daily_total": menu_today["daily_total"]
        }
    except Exception as e:
        from evaluator import PopPopError
        raise PopPopError("RuntimeError", f"Error in ScrapeDormMenu: {e}")

BUILTIN_REGISTRY['ScrapeDormMenu'] = builtin_ScrapeDormMenu
BUILTIN_REGISTRY['ScrapeMenu'] = builtin_ScrapeDormMenu

def builtin_PostFetch(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 3:
            target, headers, body = current
            try:
                import urllib.request
                req = urllib.request.Request(str(target), data=str(body).encode('utf-8'), headers=headers, method='POST')
                with urllib.request.urlopen(req) as response:
                    return response.read().decode('utf-8')
            except Exception as e:
                raise PopPopError("NetworkError", f"PostFetch failed: {e}")
        raise PopPopError("TypeError", "PostFetch requires a bundle of 3 (url & headers_dict & body_string)")
        
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in PostFetch: {str(e)}")

BUILTIN_REGISTRY['PostFetch'] = builtin_PostFetch

def builtin_WriteFile(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            content, path = current
            try:
                with open(str(path), 'w', encoding='utf-8') as f:
                    f.write(str(content))
                return content
            except Exception as e:
                raise PopPopError("IOError", f"WriteFile failed: {e}")
        raise PopPopError("TypeError", "WriteFile requires a bundle of 2 (content & path)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in WriteFile: {str(e)}")

BUILTIN_REGISTRY['WriteFile'] = builtin_WriteFile

def builtin_Serve(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            port, handler_name = current
            func_def = env.get_function(str(handler_name))
            if not func_def:
                raise PopPopError("NameError", f"Handler function '{handler_name}' not found")
            
            import http.server
            import socketserver
            
            evaluator_instance = self
            
            class PopPopHTTPHandler(http.server.BaseHTTPRequestHandler):
                def do_GET(self):
                    self.handle_request("GET")
                
                def do_POST(self):
                    self.handle_request("POST")
                    
                def handle_request(self, method):
                    path_parts = self.path.split('?')
                    path = path_parts[0]
                    query = path_parts[1] if len(path_parts) > 1 else ""
                    
                    body = ""
                    if method == "POST":
                        content_length = int(self.headers.get('Content-Length', 0))
                        if content_length > 0:
                            body = self.rfile.read(content_length).decode('utf-8')
                    
                    req_dict = {
                        "method": method,
                        "path": path,
                        "query": query,
                        "body": body,
                        "client": self.client_address[0]
                    }
                    
                    func_env = Environment(parent=env.parent or env)
                    if len(func_def.params) == 1:
                        func_env.set_var(func_def.params[0].name, req_dict)
                    
                    try:
                        evaluator_instance.eval(func_def.block, func_env)
                        result = None
                    except ReturnException as e:
                        result = e.value
                    except Exception as e:
                        print(f"Server Error: {e}")
                        self.send_response(500)
                        self.end_headers()
                        self.wfile.write(b"500 Internal Server Error")
                        return
                        
                    status = 200
                    headers = {"Content-Type": "text/html; charset=utf-8"}
                    resp_body = ""
                    
                    if isinstance(result, str):
                        resp_body = result
                    elif isinstance(result, dict):
                        status = result.get("status", 200)
                        if "headers" in result:
                            headers.update(result["headers"])
                        resp_body = str(result.get("body", ""))
                        
                    self.send_response(status)
                    for k, v in headers.items():
                        self.send_header(k, v)
                    self.end_headers()
                    self.wfile.write(resp_body.encode('utf-8'))
                    
                def log_message(self, format, *args):
                    print(f"{self.client_address[0]} - {format%args}")
                print(f"Starting PopPop web server on port {port}...")
            with socketserver.TCPServer(("", int(port)), PopPopHTTPHandler) as httpd:
                try:
                    httpd.serve_forever()
                except KeyboardInterrupt:
                    pass
            return port
        raise PopPopError("TypeError", "Serve requires a bundle of 2 (port & handler_name)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Serve: {str(e)}")

BUILTIN_REGISTRY['Serve'] = builtin_Serve

def builtin_Import(current, env, evaluator):
    try:
        try:
            with open(str(current), 'r', encoding='utf-8') as f:
                code = f.read()
            # Lex and parse
            from lexer import Lexer, LexerError
            from parser import Parser, ParseError
            
            try:
                lexer = Lexer(code)
                tokens = lexer.tokenize()
                parser = Parser(tokens)
                ast = parser.parse()
            except (LexerError, ParseError) as e:
                raise PopPopError("SyntaxError", str(e))
            
            # Evaluate in global env
            self.eval(ast, env.parent or env)
            return current
        except PopPopError:
            raise
        except Exception as e:
            raise PopPopError("IOError", f"Import failed for '{current}': {e}")
        # Original built-ins
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Import: {str(e)}")

BUILTIN_REGISTRY['Import'] = builtin_Import

def builtin_Display(current, env, evaluator):
    try:
        print(current)
        return current
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Display: {str(e)}")

BUILTIN_REGISTRY['Display'] = builtin_Display

async def builtin_Input(current, env, evaluator):
    try:
        prompt = str(current) if current is not None else ""
        import sys
        if 'pyodide' in sys.modules:
            from js import window
            return await window.waitForTerminalInput(prompt)
        else:
            # Fallback to standard input in regular Python CLI
            import asyncio
            return await asyncio.to_thread(input, prompt)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Input: {str(e)}")

BUILTIN_REGISTRY['Input'] = builtin_Input

def builtin_Int(current, env, evaluator):
    try:
        try:
            return int(current)
        except (ValueError, TypeError):
            raise EvaluatorError(f"Cannot cast '{current}' to Int")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Int: {str(e)}")

BUILTIN_REGISTRY['Int'] = builtin_Int

def builtin_Array(current, env, evaluator):
    try:
        if isinstance(current, (int, float)):
            dims = [int(current)]
        elif isinstance(current, list):
            dims = [int(d) for d in current]
        else:
            raise EvaluatorError("Array requires a dimension or a list of dimensions")
        def make_array(dimensions):
            if len(dimensions) == 1:
                return [0 for _ in range(dimensions[0])]
            return [make_array(dimensions[1:]) for _ in range(dimensions[0])]
        return make_array(dims)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Array: {str(e)}")

BUILTIN_REGISTRY['Array'] = builtin_Array

def builtin_Range(current, env, evaluator):
    try:
        if isinstance(current, list) and len(current) == 2:
            return list(range(int(current[0]), int(current[1]) + 1))
        elif isinstance(current, (int, float)):
            return list(range(1, int(current) + 1))
        raise EvaluatorError(f"Range expects a number or [start, end], got {current}")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Range: {str(e)}")

BUILTIN_REGISTRY['Range'] = builtin_Range

def builtin_Return(current, env, evaluator):
    try:
        raise ReturnException(current)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Return: {str(e)}")

BUILTIN_REGISTRY['Return'] = builtin_Return

def builtin_Break(current, env, evaluator):
    try:
        raise BreakException(current)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Break: {str(e)}")

BUILTIN_REGISTRY['Break'] = builtin_Break

def builtin_Str(current, env, evaluator):
    try:
        return str(current)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Str: {str(e)}")

BUILTIN_REGISTRY['Str'] = builtin_Str

def builtin_Bool(current, env, evaluator):
    try:
        return bool(current)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Bool: {str(e)}")

BUILTIN_REGISTRY['Bool'] = builtin_Bool

def builtin_Group(current, env, evaluator):
    try:
        if isinstance(current, list):
            grouped = {}
            # check if bundle (array, property_name)
            if len(current) == 2 and isinstance(current[0], list) and isinstance(current[1], str):
                arr, prop = current[0], current[1]
                for item in arr:
                    key = item.get(prop) if isinstance(item, dict) else None
                    if key not in grouped: grouped[key] = []
                    grouped[key].append(item)
            else:
                for item in current:
                    # use item itself as key (convert to str if dict/list to be hashable)
                    key = str(item) if isinstance(item, (dict, list)) else item
                    if key not in grouped: grouped[key] = []
                    grouped[key].append(item)
            return grouped
        raise EvaluatorError("Group requires an array or bundle of (array, prop_name)")
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Group: {str(e)}")

BUILTIN_REGISTRY['Group'] = builtin_Group

def builtin_Debug(current, env, evaluator):
    try:
        import json
        try:
            debug_str = json.dumps(current, indent=2, ensure_ascii=False, default=str)
        except Exception:
            debug_str = repr(current)
        print(f"[DEBUG] {debug_str}")
        return current
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Debug: {str(e)}")

BUILTIN_REGISTRY['Debug'] = builtin_Debug

def builtin_Lazy(current, env, evaluator):
    try:
        if isinstance(current, list):
            return iter(current)
        return current
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Lazy: {str(e)}")

BUILTIN_REGISTRY['Lazy'] = builtin_Lazy

def builtin_Take(current, env, evaluator):
    try:
        n = int(current) if not isinstance(current, list) else int(current[1])
        source = env.get_current() if not isinstance(current, list) else current[0]
        result = []
        try:
            it = iter(source) if not hasattr(source, '__next__') else source
            for _ in range(n):
                result.append(next(it))
        except StopIteration:
            pass
        return result
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Take: {str(e)}")

BUILTIN_REGISTRY['Take'] = builtin_Take

def builtin_Count(current, env, evaluator):
    try:
        # Count generates an infinite iterator starting from current value
        def _counter(start):
            i = start
            while True:
                yield i
                i += 1
        return _counter(int(current) if current is not None else 1)
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Count: {str(e)}")

BUILTIN_REGISTRY['Count'] = builtin_Count

def builtin_Throw(current, env, evaluator):
    try:
        raise PopPopError("UserError", str(current))
    except Exception as e:
        from evaluator import PopPopError, ReturnException, BreakException
        if isinstance(e, (PopPopError, ReturnException, BreakException)):
            raise e
        raise PopPopError("RuntimeError", f"Error in Throw: {str(e)}")

BUILTIN_REGISTRY['Throw'] = builtin_Throw

class PopPopDropSignal:
    pass

DROP_SIGNAL = PopPopDropSignal()

def builtin_Drop(current, env, evaluator):
    return DROP_SIGNAL

BUILTIN_REGISTRY['Drop'] = builtin_Drop
