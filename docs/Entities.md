# Nosocial Entites (alpha)

## Achievement

100 Lens Followers:
``` json
{
    "id": "0x1", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "100 Lens Followers",
    "category": "popularity",
    "provider": "NoSocial",
    "description": "Have 100 followers on the lens protocol",
    "picture": "https://xxx",
    "totalAmount": -1, // -1 means no upper limit
}
```

20 Posts:
``` json
{
    "id": "0x2", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "20 Posts",
    "category": "publictions",
    "provider": "Lenster",
    "description": "Published 20 posts on lenster",
    "picture": "https://xxx",
    "totalAmount": -1, // -1 means no upper limit
}
```

Send posts for three consecutive days:
``` json
{
    "id": "0x3", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "Send posts for three consecutive days",
    "category": "time",
    "provider": "Lenster",
    "description": "Use the Lenster APP to send post works for three consecutive days to get this reward",
    "picture": "https://xxx",
    "totalAmount": -1, // -1 means no upper limit
}
```

## AI
``` json
{
    "id": "0x4", // NTF's id 1,2,3,4...
    "contractAddress": "0x463dh..33",
    "name": "AI Content",
    "category": "AI",
    "provider": "NoSocial",
    "description": "Keywords from social content analysis",
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
    "description": "The gate to decentralized and more",
    "picture": "https://xxx",
    "achievements": ["0x1"],
    "url": ".../..."
}
```

Lenster:

``` json
{
    "id": "0x2",
    "name": "Lenster",
    "description": "Lenster is a composable, decentralized, and permissionless social media web app built with Lens Protocol.",
    "achievements": ["0x2", "0x3"],
    "picture": "https://xxx",
    "url": ".../..."
}
```

### Tasks

``` json
{
    "id": "0x1",
    "name": "Have 100 Followers",
    "description": "Get 100 Followers",
    "url": "..."
}
```

``` json
{
    "id": "0x2",
    "name": "Have 20 Posts on Lenster",
    "description": "Published 20 posts on Lenster",
    "url": "..."
}
```

``` json
{
    "id": "0x3",
    "name": "Send post on Lenster for three consecutive days",
    "description": "Send post on Lenster for three consecutive days",
    "url": "..."
}
```

### Benefits

``` json
{
    "id": "0x1",
    "rewardType": "token",
    "category": "airdrop",
    "provider": "Lenster",
    "name": "100 Matic Airdrop",
    "benefitName": "Lenster active user",
    "description": "Lenster is a composable, decentralized, and permissionless social media web app built with Lens Protocol. Use Lenster and get the airdrop",
    "picture": "https://xxx",
    "providerPicture": "https://xxx",
    "tasks": ["0x1", "0x2", "0x3"]
}
```
