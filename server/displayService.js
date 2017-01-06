var mongoDb = require('./mongodbService.js');

var getMainPage = () => {
    var mainPage = `<head>
		<title>Vector Arena</title>
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" 
		integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
		<link rel="stylesheet" type="text/css" href="client/css/style.css">
		<link rel="stylesheet" type="text/css" href="client/css/modal.css">
		<link rel="stylesheet" type="text/css" href="client/css/mapCreator.css">

		<!--<canvas id="ctx" width="500" height="500" style="border:1px solid #000000;"></canvas>-->

		<script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>
		<script>var socket = io();</script>
		<script src="client/js/userInfo.js"></script>
		<script src="client/js/user.js"></script>
		<script src="client/js/mapCreator.js"></script>
		<script src="client/js/lobby.js"></script>
		<script src="client/js/game.js"></script>
	</head>
	<body>
		<div id="regModal" class="modal">

		<!-- Registration modal content -->
			<div class="modal-content">
				<div class="modal-header">
					<span class="close" id="reg_close">&times;</span>
					<h2>Registration</h2>
				</div>
				<div class="modal-body" id="reg_modal_body">
					<form id="reg_form">
						<div class="form-group">
							<label for="user_input">Username</label>
							<input type="text" class="form-control" id="user_input" placeholder="Username" required>
						</div>
						<div class="form-group">
							<label for="pass_input">Password</label>
							<input type="password" class="form-control" id="pass_input" placeholder="Password" required>
						</div>
						<button type="submit" class="btn btn-default" id="reg_sub">Submit</button>
					</form>
				</div>
			</div>
		</div>

		<div id="logModal" class="modal">

		<!-- Login modal content -->
			<div class="modal-content">
				<div class="modal-header">
					<span class="close" id="log_close">&times;</span>
					<h2>Login</h2>
				</div>
				<div class="modal-body" id="log_modal_body">
					<span id="log_answer"></span>
					<form id="log_form">
						<div class="form-group">
							<label for="log_user_input">Username</label>
							<input type="text" class="form-control" id="log_user_input" placeholder="Username" required>
						</div>
						<div class="form-group">
							<label for="log_pass_input">Password</label>
							<input type="password" class="form-control" id="log_pass_input" placeholder="Password" required>
						</div>
						<button type="submit" class="btn btn-default" id="log_sub">Login</button>
					</form>
				</div>
			</div>
		</div>

		<div id="map_creator_modal" class="modal">

			<!-- Map creator modal content -->
			<div class="modal-content">
				<div class="modal-header">
					<span class="close" id="map_creator_close">&times;</span>
					<h2>Map creator</h2>
				</div>
				<div class="modal-body" id="map_creator_modal_body">
					<form id="map_creator_form">
						<div class="input-group">
							<label for="map_name">Name</label>
							<input type="text" class="form-control" id="map_name" placeholder="Name" required>
						</div>
						
						<label>Map size</label>
						<div class="input-group">
							<input type="number" class="form-control" id="map_width" placeholder="width" required>
							<span class="input-group-addon">-</span>
							<input type="number" class="form-control" id="map_height" placeholder="height" required>
						</div>
						
						<button type="submit" class="btn btn-default" id="reg_sub">Submit</button>
					</form>
				</div>
			</div>
		</div>
		<!--<p id="conn_num"></p>-->
		
		<header id="main_header">
			<div id="username_span"></div>
			<button class="btn btn-default" id="reg_button">Register</button>
			<button class="btn btn-default" id="log_button">Login</button>
			<button class="btn btn-default" id="logout_button">Log out</button>
			<button class="btn btn-default" id="all_maps_button">Select Map</button>
		</header>
		<center id="center">
			<article id="article">
				<div id="ctx"></div>
				<h1 id="main_title">Vector Arena</h1>
				<input type="text" class="form-control" id="name_input" placeholder="Name">
				<button type="submit" class="btn btn-default" id="play_btn" onclick="enterLobby()">Play</button>
			</article>
		</center>
		<aside id="aside">
			<div id="players"></div>
			<div id="chat"></div>
		</aside>
	</body>
	<script src="client/js/modal.js"></script>
	
	<script src="client/js/lists.js"></script>`;
}

module.exports = {
    getMainPage,
};
