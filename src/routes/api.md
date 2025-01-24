# showing all apis

## now here this api is for chat-route

## user route here
 <!--todo:  password changed: take old password and changed to new-->

 <!--Request: GET /api/users?search=John-->
* search all user by paramas this made by frontend
    -> api/v1/users/search NOTE: not tested yest

* get all usrs 
    -> api/v1/users/get-users

* get me
** using both userid and token
    --> /api/v1/users/me (work both userid and token)
    --> /api/v1/users/protected (insert the token in header)

* update name,bio,profile
    **give userid in params and name the image 'image'
    --> /api/v1/users/update-user/userid 


## auth route here
* verify email => It will send email first then in the register route it will verify then it will saved to database
    -> api/v1/auth/verify-email" NOTE: not tested yet

* register
    -> api/v1/auth/register

* email verification
    -> api/v1/auth/email-verify

* login
    -> api/v1/auth/login

* forgot password -> otp send here  through email
    -> api/v1/auth/forgot-password

* resent otp 
    ->api/v1/auth/resent-otp

* verify-otp
    -> api/v1/auth/verify-otp

* new password -> set new password here
    -> api/v1/auth/new-password

* log in  with google 
    -> api/v1/auth/google

* chaned password 
    -> api/v1/auth/change-password NOTE: not test yes

## friend route here
* send friend request
    --> api/v1/friend/sent-req/{id of user which you want to send req}
    @-> and in body send the "senderid"

* get all incomming request
    --> api/v1/friend/all-req/{id of the guy which will fetch all request}

* accept friend request
    **here if userid the id will will accept the request will come from the params
    **and the requestid is the id of the friendrequest model will come from the body

    -->put /api/v1/friend/action-req/677d5d3cc511fdf6b110a6e4 

* see  freiends
    --> /api/v1/friend/friends/677d5bebc511fdf6b110a6e0


## lets try to set user is not or offline
    <<-+ added two extra field name status & lastseen ++>
