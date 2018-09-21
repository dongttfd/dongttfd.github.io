$('#chat-box').hide();

const socket = io('https://dongtt-call-webrtc.herokuapp.com');

socket.on('user_list_online', user_list => {
    user_list.forEach(user => {
        renderUserList(user);
    });

    $('#chat-box').show();
    $('#register-box').hide();
    socket.on('new_user_online', user => {
        renderUserList(user);
    });
});

let customConfig;

$.ajax({
    url: 'https://service.xirsys.com/ice',
    data: {
        ident: 'dongtt',
        secret: '0a1443c2-bd75-11e8-bbfc-f0ee4d74a4fc',
        domain: 'dongttfd.github.io',
        application: 'default',
        room: 'default',
        secure: 1
    },

    success: (data, status) => {
        customConfig = data.d;
    },

    async: false
});

socket.on('user_offline', peerId => {
    $(`#${peerId}`).remove();
});

socket.on('register_fail', () => {
    alert('chon user khac');
});

var renderUserList = user => {
    let {userName, peerId} = user;
    $('#userListOnline ul').append(`<li id="${peerId}"> ${userName} : ${peerId}</li>`);
}

var openStream = () => {
    const config = {audio: false, video: true};
    return navigator.mediaDevices.getUserMedia(config);
}

var playVideo = (idVideoTag, stream) => {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

// openStream().then(stream => playVideo('localVideo', stream));

//init peer
var peer = new Peer({
    key: 'peerjs',
    host: 'mypeer-dongtt.herokuapp.com',
    secure: true,
    port: 443,
    config: customConfig
});

peer.on('open', id => {
    $('#myId').html(id);

    $('#btnSignup').click(() => {
        const userName = $('#userName').val();
        socket.emit('register_username', {peerId: id, userName: userName});
    })
});

//caller
$('#btnCall').click(() => {
    const id = $('#remoteId').val();
    
});

//callee
peer.on('call', call => {
    openStream()
        .then(stream => {
            call.answer(stream);
            playVideo('localVideo', stream);
            return call;
        })
        .then(call => {
            call.on('stream' , remoteStream => playVideo('remoteVideo', remoteStream));
        });
});


$('#userListOnline').on('click', 'li', function() {
    const id = $(this).attr('id');
    openStream()
        .then(stream => {
            playVideo('localVideo', stream);
            return peer.call(id, stream);
        })
        .then(call => {
            call.on('stream' , remoteStream => playVideo('remoteVideo', remoteStream));
        });
});