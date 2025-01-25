# All API related to user 

 <!--todo:  password changed: take old password and changed to new-->

##  search all user by paramas this made by frontend

     GET: api/v1/users/search?search=dinesh

       BODY : user token or userId in the body heavent decided yet
        RESPONSE*
            {
                "statusCode": 200,
                "data": {
                    "users": [
                        {
                            "googleId": null,
                            "_id": "677d5bebc511fdf6b110a6e0",
                            "username": "bhaluuu",
                            "email": "borod9200@gmail.com",
                            "avatar": {
                                "url": "https://res.cloudinary.com/kodevanacloudstorage/image/upload/v1737820702/zmczvnvbs8fzcxp6o0du.webp",
                                "_id": "677d5bebc511fdf6b110a6df"
                            },
                            "role": "USER",
                            "sentFriendReq": [],
                            "incommingFriendReq": [],
                            "createdAt": "2025-01-07T16:52:59.936Z",
                            "updatedAt": "2025-01-25T15:58:23.098Z",
                            "__v": 4,
                            "otp": 9819,
                            "friends": [
                                "677dbe9fdf12277af282c8c9",
                                "677d5d3cc511fdf6b110a6e4"
                            ],
                            "bio": "THis is function bio mother fuction",
                            "status": "online",
                            "lastSeen": "2025-01-10T12:24:21.101Z"
                        }
                    ]
                },
                "message": "Search completed successfully",
                "Success": true
            }



## get all usrs 
    GET: api/v1/users/get-users
    **RESPONSE**: 
{
    "statusCode": 200,
    "data": {
        "user": [
            {
                "googleId": null,
                "_id": "677d5bebc511fdf6b110a6e0",
                "username": "dinesh",
                "email": "borod9200@gmail.com",
                "avatar": {
                    "url": "https://res.cloudinary.com/kodevanacloudstorage/image/upload/v1736418561/ajsm22cncxgiiyjfsnd6.jpg",
                    "_id": "677d5bebc511fdf6b110a6df"
                },
                "role": "USER",
                "sentFriendReq": [],
                "incommingFriendReq": [],
                "createdAt": "2025-01-07T16:52:59.936Z",
                "updatedAt": "2025-01-10T23:42:20.700Z",
                "__v": 4,
                "otp": 9819,
                "friends": [
                    "677dbe9fdf12277af282c8c9",
                    "677d5d3cc511fdf6b110a6e4"
                ],
                "bio": "updated bio ",
                "status": "online",
                "lastSeen": "2025-01-10T12:24:21.101Z"
            },
            {
                "googleId": null,
                "bio": "Hi, i am using Tawk!",
                "status": "offline",
                "_id": "677d5d3cc511fdf6b110a6e4",
                "username": "dinesh1",
                "email": "borod9200@1gmail.com",
                "avatar": {
                    "url": "https://via.placeholder.com/200x200.png",
                    "_id": "677d5d3cc511fdf6b110a6e3"
                },
                "role": "USER",
                "sentFriendReq": [],
                "incommingFriendReq": [],
                "createdAt": "2025-01-07T16:58:36.114Z",
                "updatedAt": "2025-01-08T21:37:42.261Z",
                "__v": 2,
                "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NzdkNWQzY2M1MTFmZGY2YjExMGE2ZTQiLCJpYXQiOjE3MzYzNzIyNjIs",
                "otp": 1000,
                "friends": [
                    "677d5bebc511fdf6b110a6e0"
                ]
            },
        ]
    },
    "message": "successfully fetch all user",
    "Success": true
}

##  get me
   GET
 - using both userid and token
    + /api/v1/users/me (work both userid and token)
   + /api/v1/users/protected (insert the token in header)

     **RESPONSE**: 
    {
        "statusCode": 200,
        "data": {
            "user": {
                "googleId": null,
                "_id": "677d5bebc511fdf6b110a6e0",
                "username": "dinesh",
                "email": "borod9200@gmail.com",
                "avatar": {
                    "url": "https://res.cloudinary.com/kodevanacloudstorage/image/upload/v1736418561/ajsm22cncxgiiyjfsnd6.jpg",
                    "_id": "677d5bebc511fdf6b110a6df"
                },
                "role": "USER",
                "sentFriendReq": [],
                "incommingFriendReq": [],
                "createdAt": "2025-01-07T16:52:59.936Z",
                "updatedAt": "2025-01-10T23:42:20.700Z",
                "__v": 4,
                "otp": 9819,
                "friends": [
                    "677dbe9fdf12277af282c8c9",
                    "677d5d3cc511fdf6b110a6e4"
                ],
                "bio": "updated bio ",
                "status": "online",
                "lastSeen": "2025-01-10T12:24:21.101Z"
            }
        },
        "message": "Fetched user successfully",
        "Success": true
}

## get single user by id :=> It will return image, email, avatar
    GET: /api/v1/users/user/:userId
        **RESPONSE**
                {
                    "statusCode": 200,
                    "data": {
                        "_id": "677d5bebc511fdf6b110a6e0",
                        "username": "dinesh",
                        "email": "borod9200@gmail.com",
                        "avatar": {
                            "url": "https://res.cloudinary.com/kodevanacloudstorage/image/upload/v1736418561/ajsm22cncxgiiyjfsnd6.jpg",
                            "_id": "677d5bebc511fdf6b110a6df"
                        }
                    },
                    "message": "User fetched successfully",
                    "Success": true
               }

## update name,bio,profile
   PATCH: /api/v1/users/update-user/userid 
   **BODY**:  give userid in params and name the image 'image'
            image: "file"
            name: "name"
            bio: "bio"
    **RESPONSE**
            {
                "statusCode": 200,
                "data": {
                    "imageResults": "https://res.cloudinary.com/kodevanacloudstorage/image/upload/v1737820702/zmczvnvbs8fzcxp6o0du.webp"
                },
                "message": "Updated bio successfully",
                "Success": true
            }
