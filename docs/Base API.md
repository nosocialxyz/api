# Nosocial Base API (alpha)

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
            "twitter": "SmurfsSociety",
            "join": "2022-11-01"
        }
    },

    "aiTags": [
        {
            "id": "0x4", // AI class id
            "name": "AI Content",
            "category": "AI",
            "provider": "NoSocial",
            "description": "Keywords from social content analysis",
            "picture": "https://xxx",
            "tokenId": "0x10",
            "url": ".../...",
        },
        ....
    ],

    "achievements": [
        {
            "id": "0x1", // achievement class id
            "category": "popularity", // Classification
            "provider": "NoSocial",
            "name": "100 Followers",
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "tokenId": "0x10",
            "url": ".../...",
            "status": "ready" // There are three states: inProgress, ready, achieved; Here, only two types are returned: ready, achieved
        },
        ......
    ],

    "activites": {
        "posts": {"total": 10, "lastweek": 3},
        "comments": {"total": 10, "lastweek": 3},
        "mirrors": {"total": 10, "lastweek": 3},
        "collects": {"total": 10, "lastweek": 3}
    },

    "benefits": [
        {
            "id": "0x123",
            "rewardType": "token",
            "category": "publiction",
            "provider": "Lenster",
            "name": "1.3 ETH",
            "benefitName": "Active user",
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "providerPicture": "https://xxx",
            "url": ".../...",
            "status": "achieved", // There are three states: notStart, inProgress, achieved; there are only two types here: ready, achieved
        },
        ......
    ]
}
```

## Collect achievement

Url: Post api/v0/achievement/collect

Request:
```json
{
    "id" : "profile id",
    "achvId": "achievement class id"
}
```

Return:
```json
{
    "status": "ongoing"
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
            "description": "..., ..., ...", // lenster description
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
                    "description": "..., ..., ...",
                    "tokenId": "0x10",
                    "picture": "https://xxx",
                    "url": ".../...",
                    "status": "ready", // inProgress, ready, achieved
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
{ // achieved, inProgress, notStart
    "achieved": [...,...]
    "inProgress": [ 
        {
            "id": "0x123",
            "rewardType": "token",
            "category": "publiction",
            "provider": "Lenster",
            "name": "1.3 ETH",
            "benefitName": "Active User",
            "description": "..., ..., ...",
            "picture": "https://xxx",
            "providerPicture": "https://xxx",
            "url": ".../...",
            
            // unique information about the profile
            "status": "inProgress",
            "tasks": [
                {
                    "id": "0x123",
                    "name": "100 Followers",
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
