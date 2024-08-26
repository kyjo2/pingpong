import { appState, basePath, TUserInfo, TInvite, TFold, navigate, parseUrl } from '../../index.js';

const topHTML = `
<span class="logo-small">PONG</span>
`;

const mainHTML = `
<div class="inner_setting">
    <div class="inner_setting_window">
        <div class="inner_profile_top">
			<div class="user-profile-field"></div>
			<div class="user-button-field"></div>
        </div>
        <div class="inner_profile_main">
			<div>
				<span>win</span>
				<span class="inner_profile_win">0</span>
			</div>
			<div>
				<span>lose</span>
				<span class="inner_profile_lose">0</span>
			</div>
		</div>
        <div class="inner_profile_bottom"></div>
    </div>
</div>
`;

const rightSideHTML = `
<div class="p-button-setting">
	<img src="/assets/s-button-cog.svg">
	<span>setting</span>
</div>
<t-fold class="friend"></t-fold>
`;

export function profileUserPage(data) {
	if (!appState.isLoggedIn) {
		navigate(parseUrl(basePath + 'login'));
		return;
	}
	const leftSideHTML = `
	<t-user-info class="p-button-current" data-nick="${appState.nickname}" data-img="${appState.picture}" data-id="${appState.token}" data-isloggedin="true"></t-user-info>
	<t-invite class="receive-invitation"></t-invite>
	<t-fold class="connect"></t-fold>
	`;

	document.getElementById('top').innerHTML = topHTML;
	document.getElementById('bottom').innerHTML = "";
	document.getElementById('main').innerHTML = mainHTML;
	document.getElementById('left-side').innerHTML = leftSideHTML;
	document.getElementById('right-side').innerHTML = rightSideHTML;

	appendField(data);

	document.querySelector('.p-button-setting').addEventListener('click', () => {
		navigate(parseUrl(basePath + 'setting'))
	});
	document.querySelector('.logo-small').addEventListener('click', () => {
		navigate(parseUrl(basePath));
	});
}

async function appendField(data) {
	let user = document.createElement('t-user-info');
	user.setAttribute('data-nick', data.nickname);
	user.setAttribute('data-img', data.picture);
	user.setAttribute('data-id', data.pk);
	user.setAttribute('data-isLoggedin', 'false');
	document.querySelector('.user-profile-field').appendChild(user);

	let userInfo;
	if (data.nickname === appState.nickname) {
		userInfo = await getMyInfo(data);
		if (userInfo === null)
			return;
	}
	else {
		userInfo = await getUserInfo(data);
		if (userInfo === null)
			return;
		appendButtons(data, userInfo);
	}
	let quit = document.createElement('span');
	quit.classList.add('t-button');
	quit.innerText = 'x';
	document.querySelector('.user-button-field').appendChild(quit);

	document.querySelector('.inner_profile_win').innerText = userInfo.win;
	document.querySelector('.inner_profile_lose').innerText = userInfo.lose;
}

function appendButtons(data, userInfo) {
	let message = document.createElement('img');
	let block = document.createElement('img');
	let friend = document.createElement('img');

	message.classList.add('s-button');
	message.classList.add('s-button-message');
	block.classList.add('s-button');
	block.classList.add('s-button-block');
	friend.classList.add('s-button');
	friend.classList.add('s-button-friend');

	message.src = "/assets/s-button-message.svg";
	if (userInfo.blocked)
		block.src = "/assets/s-button-unblock.svg";
	else
		block.src = "/assets/s-button-block.svg";
	if (userInfo.following)
		friend.src = "/assets/s-button-unfollow.svg";
	else
		friend.src = "/assets/s-button-follow.svg";

	document.querySelector('.user-button-field').appendChild(message);
	document.querySelector('.user-button-field').appendChild(block);
	document.querySelector('.user-button-field').appendChild(friend);

	document.querySelector('.s-button-message').addEventListener('click', () => {messageHandler(data, userInfo);});
	document.querySelector('.s-button-block').addEventListener('click', () => {blockHandler(data, userInfo);});
	document.querySelector('.s-button-friend').addEventListener('click', () => {friendHandler(data, userInfo);});
}

function messageHandler(data, userInfo) {
	//
}

function blockHandler(data, userInfo) {
	fetch('/api/users/current/block/' + data.pk + '/', {
		method: 'POST',
		headers: {
			'Authorization': "Token " + appState.token
		}
	})
	.then((response) => {
		if (response.status === 200) {}
		else if (response.status === 401) {
			console.log('response 401')
			throw new Error('Bad Request');
		}
		else {
			console.log('Other status: ');
			throw new Error('Unexpected status code: ', response.status);
		}
	})
	.then(() => {
		console.log('userInfo.blocked', userInfo.blocked);
		if (userInfo.blocked) {
			document.querySelector('.s-button-block').src = "/assets/s-button-block.svg";
		}
		else {
			document.querySelector('.s-button-block').src = "/assets/s-button-unblock.svg";
		}
		navigate(parseUrl(basePath + 'profile/:' + data.nickname), data);
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

function friendHandler(data, userInfo) {
	fetch('/api/users/current/follow/' + data.pk + '/', {
		method: 'POST',
		headers: {
			'Authorization': "Token " + appState.token
		}
	})
	.then((response) => {
		if (response.status === 200) {}
		else if (response.status === 401) {
			console.log('response 401')
			throw new Error('Bad Request');
		}
		else {
			console.log('Other status: ');
			throw new Error('Unexpected status code: ', response.status);
		}
	})
	.then(() => {
		console.log('userInfo.blocked', userInfo.following);
		if (userInfo.following) {
			document.querySelector('.s-button-friend').src = "/assets/s-button-follow.svg";
		}
		else {
			document.querySelector('.s-button-friend').src = "/assets/s-button-unfollow.svg";
		}
		navigate(parseUrl(basePath + 'profile/:' + data.nickname), data);
	})
	.catch(error => {
		console.log('Error: ', error);
	});
}

async function getMyInfo(data) {
	try {
		const response = await fetch('/api/users/' + data.pk, {
			method: 'GET',
			headers: {
				'Authorization': "Token " + appState.token
			}
		});

		if (response.status === 200) {
			const responseData = await response.json();
			console.log('Success data:', responseData);
			return responseData;
		} else if (response.status === 400) {
			const errorData = await response.json();
			let errorMessage = 'Error 400: Bad Request\n';
			console.log(errorMessage, errorData);
			throw new Error('Bad Request');
		} else {
			const errorData = await response.json();
			console.log('Other status:', errorData);
			throw new Error('Unexpected status code: ' + response.status);
		}
	} catch (error) {
		console.log('Error:', error);
		throw error;
	}
}

async function getUserInfo(data) {
	try {
		const response = await fetch('/api/users/current/other/' + data.pk, {
			method: 'GET',
			headers: {
				'Authorization': "Token " + appState.token
			}
		});

		if (response.status === 200) {
			const responseData = await response.json();
			console.log('Success data:', responseData);
			return responseData;
		} else if (response.status === 400) {
			const errorData = await response.json();
			let errorMessage = 'Error 400: Bad Request\n';
			console.log(errorMessage, errorData);
			throw new Error('Bad Request');
		} else {
			const errorData = await response.json();
			console.log('Other status:', errorData);
			throw new Error('Unexpected status code: ' + response.status);
		}
	} catch (error) {
		console.log('Error:', error);
		throw error;
	}
}