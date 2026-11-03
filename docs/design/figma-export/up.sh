#!/bin/bash
# up.sh file.png submitUrl -> prints imageHash and placed node id
curl -s -F "file=@$1;type=image/png" "$2" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('imageHash'),d.get('placedOnNodeId'),d.get('success'),d.get('error',''))"
