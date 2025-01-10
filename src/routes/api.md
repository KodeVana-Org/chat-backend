# showing all apis

## User Route here
* get all usrs 
    -> api/v1/users/get-users
* get me
** using both userId and token
    --> /api/v1/users/me (work both userId and token)
    --> /api/v1/users/protected (insert the token in header)

* update name,bio,profile
    **give userId in params and name the image 'image'
    --> /api/v1/users/update-user/userId 


## Auth Route here
* register
    -> api/v1/auth/register
* login
    -> api/v1/auth/login
* forgot password
    -> api/v1/auth/forgot-password
* verify-otp
    -> api/v1/auth/verify-otp
* new password
    -> api/v1/auth/new-password
* log in  with google
    -> api/v1/auth/google


## Friend Route here
* send friend request
    --> api/v1/friend/sent-req/{id of user which you want to send req}
    @-> and in body send the "senderId"

* get all incomming request
    --> api/v1/friend/all-req/{id of the guy which will fetch all request}

* accept friend request
    **here if userId the id will will accept the request will come from the params
    **and the requestId is the id of the friendRequest model will come from the body

    -->put /api/v1/friend/action-req/677d5d3cc511fdf6b110a6e4 

* see  freiends
    --> /api/v1/friend/friends/677d5bebc511fdf6b110a6e0


## Lets try to set user is not or offline
    <<-+ Added Two extra field name status & lastSeen ++>
