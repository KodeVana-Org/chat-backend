# showing all apis

## now here this api is for chat-route


## auth route here

> it will take only email and send otp to the response
* verify email
>PURPOSE:  This route  will send otp to the email 
* BODY: email ( only take email in body)
    -> api/v1/auth/register"

*  **BODY: username(must be unique), email, password, otp
* register
    -> api/v1/auth/verify-email"

*  **BODY: {email, password}
* login
    -> api/v1/auth/login

* BODY: {emaill}  
* forgot password -> otp send here  through email
    -> api/v1/auth/forgot-password

* BODY: {email}
* resent otp 
    ->api/v1/auth/resent-otp

* BODY: {email}
* verify-otp
    -> api/v1/auth/verify-otp

* BODY: {email, new_password}
* new password -> set new password here
    -> api/v1/auth/new-password

* BODY :{email, oldPassword, newPassword }
* chaned password  
-> api/v1/auth/change-password NOTE: not test yes

* log in  with google 
    -> api/v1/auth/google


## friend route here
* send friend request
    --> api/v1/friend/sent-req/{id of user which you want to send req}
    @-> and in body send the "senderid"

* get all incomming request
    --> api/v1/friend/all-req/{id of the guy which will fetch all request}

* get all outging request (the users which i have send freinds request)
   --> api/v1/friend/all-req-ongoing/{userId}

* accept friend request
    **here if userid the id will will accept the request will come from the params
    **and the requestid is the id of the friendrequest model will come from the body

    -->put /api/v1/friend/action-req/677d5d3cc511fdf6b110a6e4 

* see  freiends
    --> /api/v1/friend/friends/677d5bebc511fdf6b110a6e0

## conversation Route
   * Create Conversation :=> Body: 
   POST:-> /api/v1/conversation/:userId

   * Get all conversation
   GET:-> /api/v1/conversation/con

   * Get conversation by conversationId
   GET:-> /api/v1/conversation/{conversationId}

   * Rename group :=> 
            Take the userId {who will change group name in params}
            Body: newName, conversationId
    PATCH :=> /api/v1/conversation/rename-group/:userId

    * Delete the group by admin
            Take the groupId by body
    DELETE :=> /api/v1/conversation/delete-group/:userId

    * Remove member from group by admin
           Body: 
                memberId (To remove)
                groupId
    POST:=> /api/v1/conversation/remove-member/:userId

    * Add Member in group
            Body: 
                newMemberId
                groupId
    POST:=> /api/v1/conversation/add-member/:userId


## Message Route
    * send message
  
     //TEXT
    // "conversationId":"6793d5f1818ebb2b43c91243",
    // "type": "Text",
    // "sender":"677dbe9fdf12277af282c8c9",
    // "content": "Hello! How are you?"

    //MEDIA
    // "type": "Media",
    // "sender":"677dbe9fdf12277af282c8c9",
    // "conversationId":"6793d5f1818ebb2b43c91243",
    // "content": "Im fine",
    // "media": [
    //             { "type": "image", "url": "https://example.com/image1.jpg" },
    //             { "type": "video", "url": "https://example.com/video1.mp4" }
    //         ]

    //Document
    // "type": "Document",
    // "sender":"677dbe9fdf12277af282c8c9",
    // "conversationId":"6793d5f1818ebb2b43c91243",
    // "content":"im fine too bro",
    //                 "document": {
    //                 "url": "https://example.com/document.pdf",
    //                 "name": "My Document",
    //                 "size": 12345
    //             }

     //Document
    // "type": "Audio",
    // "sender":"677dbe9fdf12277af282c8c9",
    // "conversationId":"6793d5f1818ebb2b43c91243",
    // "content":"im fine too bro",
    // "audioUrl": "https://example.com/audio.mp3"

        POST :=> /api/v1/message

    * get message by conversationId 
        GET :=> /api/v1/message/{conversationId}

    * delete the message 
            messageId in params
            userId in body
        DELETE:=> /api/v1/message/{messageId} 

    * fetch media
      GET /api/message/:messageId/media
         ** Response:=>
                    {
                        "status": 200,
                        "data": {
                            "media": [
                                {
                                    "type": "image",
                                    "url": "https://cloudinary.com/some-image.jpg"
                                },
                                {
                                    "type": "video",
                                    "url": "https://cloudinary.com/some-video.mp4"
                                }
                            ]
                        },
                        "message": "Media fetched successfully"
                    }

            ** Status: 404
                    {
                        "status": 404,
                        "message": "No media found for this message"
                    }
    



## lets try to set user is not or offline
    <<-+ added two extra field name status & lastseen ++>
