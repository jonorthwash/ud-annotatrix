import requests
import json

API_BASE_URL = 'https://api.github.com/'

def get_username(token):
    url = API_BASE_URL + 'user?access_token=' + token
    res = requests.get(url)
    if res.status_code != 200:
        raise ValueError(f'invalid response (${res.status_code}) from {url}')

    data = res.json()
    return data['login']
