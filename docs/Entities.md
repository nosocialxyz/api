# Nosocial Entites (beta)

## AI (TODO)
... ...
## Achievement

100 Lens Followers:
``` json
{
    "id": "0x1", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "100 Lens Followers",
    "category": "popularity",
    "provider": "NoSocial",
    "bio": "Have 100 followers on the lens protocol",
    "description": "Have 100 followers on the lens protocol",
    "picture": "https://xxx",
    "totalAmount": -1, // -1 means no upper limit
}
```

20 Posts in Lenster:
``` json
{
    "id": "0x2", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "20 Posts in Lenster",
    "category": "publictions",
    "provider": "Lenster",
    "bio": "Published 20 posts on lenster",
    "description": "Published 20 posts on lenster to get '20 Posts in Lenster' achievement",
    "picture": "https://xxx",
    "totalAmount": -1, // -1 means no upper limit
}
```

Send post on Lenster for three consecutive days:
``` json
{
    "id": "0x3", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "Send post on Lenster for three consecutive days",
    "category": "time",
    "provider": "Lenster",
    "bio": "Use the Lenster APP to send post works for three consecutive days to get this reward",
    "description": "Use the Lenster APP to send post works for three consecutive days to get this reward",
    "picture": "https://xxx",
    "totalAmount": -1, // -1 means no upper limit
}
```

### Apps

NoSocial

``` json
{
    "id": "0x1",
    "name": "NoSocial",
    "bio": "The gate to decentralized and more",
    "description": "The gate to decentralized and more",
    "picture": "https://xxx",
    "achievements": ["0x1"],
    "url": ".../..."
}
```

NoSocial:

``` json
{
    "id": "0x2",
    "name": "Lenster",
    "bio": "Lenster is a composable, decentralized, and permissionless social media web app built with Lens Protocol.",
    "description": "Lenster is a composable, decentralized, and permissionless social media web app built with Lens Protocol.",
    "achievements": ["0x2", "0x3"],
    "picture": "https://xxx",
    "url": ".../..."
}
```

### Benefits

``` json
{
    "id": "0x1",
    "rewardType": "token",
    "category": "airdrop",
    "provider": "Lenster",
    "name": "Lenster active user",
    "bio": "100 Matic Airdrop",
    "description": "Lenster is a composable, decentralized, and permissionless social media web app built with Lens Protocol. Use Lenster and get the airdrop",
    "totalAmount": -1, // -1 means no upper limit
    "picture": "https://xxx",
    "providerPicture": "https://xxx",

     "tasks": [
        {
            "id": "0x1",
            "name": "Have '100 Followers' achievement",
            "bio": "Get 100 Followers achievement",
            "description": "Get 100 Followers achievement",
            "requrieAchievements": ["0x1"],
            "url": "..."
        },
        {
            "id": "0x2",
            "name": "Get '20 Posts in Lenster' achievement",
            "bio": "Published 20 posts on lenster",
            "description": "Published 20 posts on lenster to get '20 Posts in Lenster' achievement",
            "requrieAchievements": ["0x2"],
            "url": "..."
        },
        {
            "id": "0x3",
            "name": "Get 'Send post on Lenster for three consecutive days' achievement",
            "bio": "Send post on Lenster for three consecutive days",
            "description": "Send post on Lenster for three consecutive days",
            "requrieAchievements": ["0x3"],
            "url": "..."
        }
    ]
}
```