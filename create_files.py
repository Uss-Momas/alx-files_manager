import requests
import base64

# create user if not exists
email = 'bob@dylan.com'
password = 'toto1234!'
user_data = {"email": email, "password": password}

new_user = requests.post('http://127.0.0.1:5000/users', json=user_data)
print(new_user.json())

message = f'{email}:{password}'
message_bytes = message.encode('utf-8')
credentials = base64.b64encode(message_bytes).decode('utf-8')
r_headers = {'authorization': f'Basic {credentials}'}

token = requests.get('http://127.0.0.1:5000/connect', headers=r_headers)
token = token.json()
print(token.get('token'))

initialFolders = []
for i in range(25):
    r_json = {
        'name': f'folder {i + 1}', 'type': 'folder',
        'parentId': 0
        }
    r_headers = {'X-Token': token.get('token')}

    r = requests.post("http://127.0.0.1:5000/files",
                      json=r_json, headers=r_headers)
    newFolder = r.json()
    print(r.json())
    initialFolders.append(newFolder)


initialFiles = []
for i in range(25, 27):
    r_json = {
        'name': f'File {i + 1}', 'type': 'folder',
        'parentId': initialFolders[0].get('id')
        }

    r_headers = {'X-Token': token.get('token')}

    r = requests.post("http://127.0.0.1:5000/files",
                      json=r_json, headers=r_headers)
    newFile = r.json()
    print(r.json())
    initialFiles.append(newFile)


print(initialFiles[0].get('parentId'))
