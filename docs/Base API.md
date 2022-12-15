# Nosocial Base API (beta)

## API template

Version：api/v0/

Return must have fields:
```json
{
    "code": 200,
    "message": "success"
    ... ...
    ... ...
}
```

## White List

Url: Get api/v0/account/whitelist

Request:
- address

Return:
```json
{
    "inWhiteList": true 
}
```

## Get Profile List

Url: Get api/v0/account/profiles

Request:
- address

Return:
```json
{
    "profiles": [
        {
            "id": "0x018a8d",
            "name": "The XXX",
            "handle": "xxx.lens"
        },
        ...
    ]
}
```

## Get Profile

Url: Get api/v0/profile/base

Request:
- id : Profile id

Return:
```json
{
    "info": {
        "id": "0x018a8d",
        "picture": "https://xxx",
        "coverPicture": "https://xxx",
        "ownedBy": "0x42d40F181B3Ff16141726D924517A8cd0E78E27b",
        "name": "The xxx",
        "handle": "xxx.lens",
        "bio": "The xxx is ....",
        "followers": 127,
        "following": 15,
        "attributes": {
            "location": "Brussels",
            "website": "https://nft.smurf.com/",
            "twitter": "SmurfsSociety"
        }
    },

    "aiTags": [
        {
            "id": "0x123",
            "category": "default",
            "value": "Lens",
            "bio": "This is xxx",
            "url": ".../...",
            "description": "..., ..., ..."
        },
        {
            "id": "0x456",
            "category": "hobby",
            "value": "Music",
            "bio": "..., ...",
            "url": ".../...",
            "description": "..., ..., ..."
        }
        ....
    ],

    "achievements": [
        {
            "id": "0x123",
            "category": "popularity", // Classification
            "provider": "NoSocial",
            "name": "100 Followers",
            "bio": "This is xxx",
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "url": ".../...",
            "status": "ready", // There are three states: notStart, ready, achieved; Here, only two types are returned: ready, achieved
        },
        ......
    ],

    "activites": {      
        "posts": 2,
        "comments": 0,
        "mirrors": 0,
        "collects": 255
    },

    "benefits": [
        {
            "id": "0x123",
            "rewardType": "token",
            "category": "publiction",
            "provider": "Lenster",
            "name": "Active user",
            "bio": "1.3 ETH",
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "providerPicture": "https://xxx",
            "url": ".../...",
            "status": "achieved", // There are four states: notStart, inProgress, ready, achieved; there are only two types here: ready, achieved
        },
        ......
    ]
}
```

## Get Apps base information

Url: Get api/v0/apps/base

Request:
- id : Profile id

Return:
```json
{
    "actived": [ // App has two states notStart and actived
        {
            "id": "0x123",
            "name": "Lenster",
            "bio": "This is xxx", // lenster bio
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "url": ".../...",

            // The following is unique information about the profile
            "activites": {      
                "posts": 2,
                "comments": 0,
                "mirrors": 0,
                "collects": 255
            },

            "achievements": [
                {
                    "id": "0x123",
                    "category": "popularity", 
                    "provider": "Lenster", // Must be provided by the app
                    "name": "100 Followers",
                    "bio": "This is xxx",
                    "description": "..., ..., ...",
                    "picture": "https://xxx",
                    "url": ".../...",
                    "status": "ready", // notStart, ready, achieved
                },
                ...
            ] 
        },
        ......
    ],
    "notStart": [...]
}
```

## Get benefits base infromation

Url: Get api/v0/benefits/base

Request:
- id : Profile id

Return:
```json
{ // ready, inProgress, notStart
    "ready": []
    "inProgress": [ 
        {
            "id": "0x123",
            "rewardType": "token",
            "category": "publiction",
            "provider": "Lenster",
            "name": "Active user",
            "bio": "1.3 ETH",
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "providerPicture": "https://xxx",
            "url": ".../...",
            "expireTime": 1212343246324,
            
            // unique information about the profile
            "status": "inProgress",
            "tasks": [
                {
                    "id": "0x123",
                    "name": "Get 100 Followers achieve",
                    "bio": "..., ...",
                    "description": "...",
                    "url": "...",
                    "isFinished": false
                },
                ...
            ]
        },
    ],
    "notStart": [...]
}
```
