// chat ui 기능
var globalUserId = "";
let stomp;
var globalRoomId;
var reciId = "";
var ppid = "";

var state = 0;











function openChat () {
  document.getElementById('container').classList.add('open');
  var roomAndChatMessages = getRoomAndMessages(globalUserId)
  makeChatConversationDom(roomAndChatMessages) 
  state = 1;
}

function closeChat () {
  document.getElementById('container').classList.remove('open');
  document.querySelector('.list').classList.remove('close');
  document.querySelector('.chat').classList.add('close');
  document.getElementById('back').classList.add('hidden');
  
  closeDrawer();
   
}

function backChat () {
  document.querySelector('.list').classList.remove('close');
  document.querySelector('.chat').classList.add('close');
  document.getElementById('back').classList.add('hidden');
  document.querySelector('.header .title').textContent = 'Chat';
  
  closeDrawer();


  // 채팅방 나가기
  leaveRoom(globalRoomId)
}

function openDrawer () {
  document.querySelector('.drawer').classList.remove('close');


  
}

function closeDrawer () {
  document.querySelector('.drawer').classList.add('close');
}


// /**
//  * 채팅방 목록중 한개를 클릭했을 떄 발생되는 이벤트 함수입니다.
//  * 1.서버로 부터 해당 채팅방에 있는 모든 메시지를 받아와서 렌더링합니다.
//  *  이 경우 타인의 메시지는 왼쪽에 / 나의 메시지는 오른쪽에 위치하도록 렌더링 합니다.
//  *  하나의 개별 메시지에 있는 요소는 메시지, 날짜, 닉네임, 읽은 상태 4가지 이다.
//  */
document.addEventListener('click',function(e){
  if(e.target.parentElement.className == 'top' || e.target.parentElement.className == 'bottom'){

        document.querySelectorAll('.conversation').forEach(function (conversation) {

        conversation.addEventListener('click', function (e) {
          console.log(e.target.parentElement.parentElement.classList[1].split('-')[1])
          var roomId = e.target.parentElement.parentElement.classList[1].split('-')[1]
          console.log("===================================================================")
          console.log(e.target.parentElement.parentElement.classList[3].split('-')[1]);
          console.log("===================================================================")
          var recipentId = e.target.parentElement.parentElement.classList[3].split('-')[1]
          console.log(recipentId)
          var pid = e.target.parentElement.parentElement.classList[4].split('-')[1];
          console.log(pid)
          console.log("===================================================================**************************")
          

          document.querySelector('.list').classList.add('close');
          document.querySelector('.chat').classList.remove('close');
          document.getElementById('back').classList.remove('hidden');
          document.querySelector('.header .title').textContent = roomId; // 개별 채팅방을 구별하기 위해 임시로 채팅방 헤더레 룸 아이디를 넣음
          document.querySelector('.header .recipent-id').textContent = recipentId; // 상대방 아이디


          globalRoomId = roomId;
          reciId = recipentId;
          ppid = pid;


          renderChatMessagesOfAroom(getMessagesBySpecificRoomId(globalRoomId));
          /**
           * id: 25
              message: "gddgd"
              productId: 17
              recipentId: 4
              roomId: 18
              senderId: 1
              sentDate: "2020-09-24T15:46:21.000+00:00"
              status: 0
          */         
          // 채팅방에 들어가는 순간 해당 채팅방에 가입합니다.
          joinRoom(roomId);
      });
    });
  }
});





// function conversationClickEvent(){
//   document.addEventListener('DOMContentLoaded', function () {
//     document.querySelectorAll('.conversation').forEach(function (conversation) {

//       conversation.addEventListener('click', function () {
//         document.querySelector('.list').classList.add('close');
//         document.querySelector('.chat').classList.remove('close');
//         document.getElementById('back').classList.remove('hidden');
//         document.querySelector('.header .title').textContent = 'Title';



//       });  
//     });
//   });
// }



// Fire once
document.querySelectorAll('focus.auto-expand, textarea.auto-expand').forEach(item => {
  item.addEventListener('click', function (e) {
    if(e.currentTarget.dataset.triggered) return;
    e.currentTarget.dataset.triggered = true;
    var savedValue = this.value;
    this.value = '';
    this.baseScrollHeight = this.scrollHeight;
    this.value = savedValue;
  });
});

// Fire anytime
document.querySelectorAll('input.auto-expand, textarea.auto-expand').forEach(item => {
  item.addEventListener('input', function (e) {
    var minRows = this.getAttribute('data-min-rows') | 0;
    this.rows = minRows;
    rows = Math.ceil((this.scrollHeight - this.baseScrollHeight) / 17);
    this.rows = minRows + rows;
    this.scrollTop = this.scrollHeight;
  });
});


// 채팅 메시지 보내기 버튼
document.getElementById('msg-send-btn').addEventListener('click', function(e) {
  console.log(e.target)

  var msgContent = document.getElementById('message-input').value;
  console.log(
    "obejctId : " + ppid + "\n" +
    "senderId : " + globalUserId + "\n" +
    "recipentId : " + reciId + "\n" +
    "message : " + msgContent + "\n"
  );

  var tmessage =
      {
          objectId : ppid,
          senderId : globalUserId,
          recipentId : reciId,
          message : msgContent
      }
  sendMessage(tmessage);
})




/****************************************************** chat feature **********************************************/

/**
 * 로그인을 시도합니다.
 */
function login(){
  var formData = $("#form1").serialize();
  $.ajax({
      cache : false,
      url : "http://localhost:8080/api/v1/hello", // 요기에
      type : 'POST',
      data : formData,
      success : function(data) {
          console.log(formData);
          var userid = formData.split('=')[1];
          console.log(userid);

          // 채팅 UI 보여 주기
          show(document.getElementById('chatbtn'));


          // 메시지 가져오기 & 읽지않은 메시지 개수를 화면에 보여줍니다.
          var unreadMsg = getUnreadMessages(userid);
          unreadMessageCnt(unreadMsg);

          // 소켓연결
          connect(userid);

          globalUserId = userid;

      }, // success

      error : function(xhr, status) {
          alert(xhr + " : " + status);
      }
  }); // $.ajax */
}


/**
 * 서버와 웹 소켓연결을 시도합니다. 
 * 
 * @param {*} userId 로그인할 떄 전송하는 사용자 아이디
 * @returns 웹소켓 연결객체를 반환합니다
 */
const connect = (userId) => {
  socket = new SockJS('http://localhost:8080/ws');
  stomp = Stomp.over(socket);
  var headers = {
    userId : userId
  };
  stomp.connect(headers, (frame) => { 
    console.log(frame)// return stompClient
    subScribe(userId, stomp)})
    
    
    

    // default, granted, denied
    console.log(Notification.permission); 
    if(Notification.permission === "granted"){
      // showNotification();
      console.log("permission granted!! ")
    }else if (Notification !== "denied") {
      Notification.requestPermission().then(permission => { // pop up ! 뛰움.
        if(permission === "granted"){
          // showNotification();
          console.log("permission granted!! ")
        }
      }); 
    }
}



/**
 * 
 * @param {*} path subscribe 하는 경로, 이 path 로 보내는 모든 메시지는 여기로 온다.
 * @param {*} stompClient 서버와 웹소켓 연결 후에 얻은 웹소켓 클라이언트
 */
const subScribe = (userId, stompClient) => {
  stomp = stompClient
  stompClient.subscribe("/topic/chat/" + userId, function (frame) {
    const unRead = document.getElementById('unreadCntBadge').textContent;
    document.getElementById('unreadCntBadge').textContent = parseFloat(document.getElementById('unreadCntBadge').textContent) + parseFloat(1);

    //              <div id="con" class="conversation active">
    //                   <div class="top">
    //                       <span class="badge">2</span>
    //                       <span class="title">Title</span>
    //                       <span class="time">Yesterday</span>
    //                   </div>
    //                   <div class="bottom">
    //                       <span class="user">Sofia:</span>
    //                       <span class="message">last message</span>
    //                   </div>
    //               </div>



    // 노티피케이션 테스트 (유저가 어디에 있던 띄어주면 이상한가?.. 맞아 이상해 왜냐하면 상대방이랑 대화하고 있는데 noti면 이상하지!!)
    // 현재 유저가 어디있는 지를 판단해서 보내주자! 
    if(state == 0){ // 만약 채팅창을 클릭하지 않은 상태라면
      if(Notification.permission === "granted"){
        var notification = new Notification("New Message fromn dcode!", {
          body : JSON.parse(frame.body).message,
        });
      }
    }else if(state == 1){ // 채팅창 목록화면에 들어온 상태
      // 모든 .conversion 인 태그를 찾는다.
      document.querySelectorAll('.conversation').forEach(function(conversation) {
        
        // 그 중에서 만약에 기존에 채팅방이 있을 경우에는
        if(conversation.classList.contains('recipent-' + JSON.parse(frame.body).senderId) && conversation.classList.contains('product-' + JSON.parse(frame.body).objectId)){
          console.log('채팅방 UI에 있음')
          
          conversation.querySelector('.badge').textContent = parseFloat(conversation.querySelector('.badge').textContent) + 1
          conversation.querySelector('.bottom .message').textContent = JSON.parse(frame.body).message;

          var userId = getUserOf(JSON.parse(frame.body).senderId);
          
          
          conversation.querySelector('.bottom .user').textContent = userId.userNickname
        }else {
          console.log('채팅방 UI에 없음') 
        }
      })
    }
  })
}


/**
 * 
 * @param {*메시지} message 서버로 전송하게 될 메시지 내용
 */
const sendMessage = (message) => {
  // stomp.send("/message", {}, JSON.stringify(tmessage));
  stomp.send("/message", { 'chatRoomId' : globalRoomId }, JSON.stringify(message), (frame) =>{
    console.log(frame)
})
}


/**
 * @param {*} roomId roomId를 받아 해당 채팅방에 가입합니다.
 */
const joinRoom = (roomId) => {
  console.log("userId : " + globalUserId);
  console.log("roomId : " + roomId);
  stomp.send("/room/join", { 'chatRoomId' : roomId , 'userId' : globalUserId}, function(frame){
    console.log(frame)
  
  })
}


/**
 * @param {*} roomId 를 받아 해당 채팅방에서 나갑니다. 
 */
const leaveRoom = (roomId) => { 
  console.log("userId : " + globalUserId);
  console.log("roomId : " + roomId);

  stomp.send("/room/leave", { 'chatRoomId' : roomId , 'userId' : globalUserId}, function(frame){
    console.log(frame)
  })
}


// window close event
window.addEventListener("beforeunload", function (event) {
  client.disconnect(function() {
    alert("See you next time!");
  });
});








/************************************************** NOTIFICATION message rendering [ to user NOTIFICATION UI] **********************************************/

const renderNotificationMessage = (message) => {
  alert("got message by some user , conetent is \n " + message);
}

function showNotification() {
  var notification = new Notification("New Message fromn dcode!", {body : "hello wolrd"});
};










/************************************************** CHAT message rendering [ to user CHAT UI ]**********************************************/

// 로그인 성공 시 채팅 버튼이 생깁니다
var show = function (elem) {
	elem.style.display = 'block';
};


// 읽지 않은 메시지 개수를 가져와 사용자에게 보여줍니다.
var unreadMessageCnt = function(messages){
  document.getElementById("unreadCntBadge").innerText = messages.length;
}

/**
 * 
 * @param {*} rooms 사용자가 가지고 있는 채팅방의 정보들
 * 을 받아 채팅방 목록 화면에 렌더링하는 함수(채팅방 목록 / 최근 메시지 / 안읽은 메시지 등)
 */
const makeChatConversationDom = function(rooms){
  const convetsations = document.querySelector('.conversations')

  
  
  for (var i in rooms){
    let unreadMsgCnt;
    let latestMsg;
  

    // 각 채팅방의 가장 최근 메시지를 찾는다.
    latestMsg = rooms[i].chatMessage[0]

    // 각 채팅방의 읽지 않은 메시지 개수 찾는 다.
    if(rooms[i].chatMessage.length != 0){ // 한개라도 있는 것들 
      unreadMsgCnt = rooms[i].chatMessage.filter(msg => msg.status == 0 && msg.senderId != globalUserId).length
    }
    


    const conversation = document.createElement("div");
    conversation.className = "conversation";

    if(rooms[i].recipentId == globalUserId){
      conversation.classList.add("chatroom-" + rooms[i].roomId, "con", "recipent-" + rooms[i].senderId, "product-" + rooms[i].productId);
    }else{
      conversation.classList.add("chatroom-" + rooms[i].roomId, "con", "recipent-" + rooms[i].recipentId, "product-" + rooms[i].productId);
    }

    
  

    const top = document.createElement("div");
    top.className = "top";
  
    const topBadge = document.createElement("span")
    topBadge.className = "badge";
    topBadge.textContent = unreadMsgCnt; // 상대방이 읽지 않은 상태만 반영해야함. 상대방이 나의 메시지를 읽지 않아서 상태값이 0인것은 반영하면 안됨

    
    
    
    
    

    const topTtitle = document.createElement("span")
    topTtitle.className = "title"
    topTtitle.textContent = "물건번호 : " + rooms[i].productId
  

    const topTime = document.createElement("span")
    topTime.className = "time"
    topTime.textContent = latestMsg.sentDate.split('.000')[0].replace('T', ' / ').replace('2020-', '');
        



    
    


    const bottom = document.createElement("div")
    bottom.className = "bottom"

    const bottomUser = document.createElement("div")
    bottomUser.className = "user"
  
    bottomUser.textContent = getUserOf(latestMsg.senderId).userNickname; // 이걸로 유저의 아이디를 얻어야함
    




    const bottomMessage = document.createElement("div")
    bottomMessage.className = "message"
    bottomMessage.textContent = latestMsg.message;


    console.log(bottom)
    console.log(bottomUser)
    console.log(bottomMessage)



    top.appendChild(topBadge)
    top.appendChild(topTtitle)
    top.appendChild(topTime)
    console.log(top)

    bottom.appendChild(bottomUser)
    bottom.appendChild(bottomMessage)
    console.log(bottom)

    conversation.appendChild(top)
    conversation.appendChild(bottom)
    
    console.log(conversation)

    convetsations.appendChild(conversation)
  } 
}




const renderChatMessagesOfAroom = (messagesOfAroom) => {
  // 메시지를 분류하자
  // 시간대별로 분류 ? 아니 이미 되어있다!!?
  console.log("renderChatMessagesOfAroom")
  console.log(messagesOfAroom)

  const chatBody = document.querySelector('.chat-body')

  for(var i in messagesOfAroom){

    const msgbox = document.createElement('div')
    const readStatus = document.createElement('p')
    readStatus.style.color = 'black'

    if(messagesOfAroom[i].status == "1"){
      readStatus.textContent = '읽음'
    }else{
      readStatus.textContent = '읽지않음'
    }


    if(messagesOfAroom[i].senderId != globalUserId){  
      msgbox.classList.add('user', 'left')
    }else{
      msgbox.classList.add('user', 'right')
    }

      const messages = document.createElement('div')
      messages.className = 'messages'



      const message = document.createElement('div')
      message.className = 'message'

      
      
      
      


      const messageContainer = document.createElement('div')
      messageContainer.className = 'message-container'

      const messageSender = document.createElement('div')
      messageSender.className = 'message-sender'
      messageSender.textContent = messagesOfAroom[i].senderId

      const pMessage = document.createElement('p')
      pMessage.className = 'text'
      pMessage.innerHTML = messagesOfAroom[i].message

      const messageTime = document.createElement('div')
      messageTime.className = 'message-time'
      messageTime.innerHTML = messagesOfAroom[i].sentDate.split("T15")[0]
      
      messageContainer.appendChild(messageSender)
      messageContainer.appendChild(pMessage)

      message.appendChild(messageContainer)
      message.appendChild(messageTime)
      messages.appendChild(message)


      msgbox.appendChild(messages)
      msgbox.appendChild(readStatus)

      chatBody.appendChild(msgbox)
  }
}








/**
 * @description
 * 1. 읽지 않은 채팅 메시지 개수를 가져옵니다.
 * 2. 
 */
/************************************************** 채팅과 관련된 정보 등을 rest api 를 통해 가져옵니다 **********************************************/

// 유저가 읽지 않은 메시지들을 가져옵니다. 
function getUnreadMessages(userId){
  var result = "";
  $.ajax({
    cache : false,
    url : "http://localhost:8080/api/v1/chat/messages/unread/" + userId, // 요기에
    type : 'GET',
    async : false,
    success : function(data) {
      result = data;
    }, // success

    error : function(xhr, status) {
        alert(xhr + " : " + status);
    }
  }); // $.ajax */
  return result;
}

// 각 채팅방 별 채팅메시지들을 전부 가져옵니다. 
function getRoomsInfo(userId){
  var result = "";
  $.ajax({
    cache : false,
    url : "http://localhost:8080/api/v1/chat/rooms/" + userId, // 요기에
    type : 'GET', 
    success: function (data) {
      
      // 가져온 채팅방 번호를 통해 다시 해당 채팅방의 모든메시지를 가져옵니다. 
      for (var i in data){
        $.ajax({
          type: "GET",
          url: "http://localhost:8080/api/v1/chat/room/" + data[i].roomId + "/messages",
          success: function (messages) {            
            // 새로운 key 를 추가하는 데 이름은 'messages' 이고 value 가 json array() 인 새로운 값을 추가한다.
            data[i]["messages"] = messages
            console.log(data[i])
          }
        });
      }
  
    },// success
    error : function(xhr, status) {
        alert(xhr + " : " + status);
    }
  }); // $.ajax */
  // return result;
}

function getRoomAndMessages(userId){
  var result = "";
  $.ajax({
    cache : false,
    url : "http://localhost:8080/api/v1/chat/rooms/" + userId, // 요기에
    type : 'GET',
    async : false,
    success : function(data) {
      console.log(data)
      result = data
    }, // success
    error : function(xhr, status) {
        alert(xhr + " : " + status);
    }
  }); // $.ajax */
  return result;
}



/**
 * 유저의 고유한 번호로 사용자의 정보를 가져옵니다.
 * @param {d} userId 
 */
function getUserOf(userId){
  var result = "";
  $.ajax({
    cache : false,
    url : "http://localhost:8080/api/v1/user/" + userId, // 요기에
    type : 'GET',
    async : false,
    success : function(data) {
      console.log("getUserOf : " + userId + "\n" + data.userNickName)
      result = data
    }, // success
    error : function(xhr, status) {
        alert(xhr + " : " + status);
    }
  }); // $.ajax */
  return result;
}


function getMessagesBySpecificRoomId(roomId){
  var result = ""
  $.ajax({
    cache : true,
    url : "http://localhost:8080/api/v1/chat/room/" + roomId + "/messages",
    type : 'GET',
    async : false,
    success : function(data){
      console.log(data)
      result = data
    }, // success
    error : function(xhr, status){
      alert(xhr + " : " + status)
    }
  });
  return result
}