// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var moment = require('moment');
var twitterApi = require('twitter-node-client');
var Twitter = require('twitter');
var jquery = require('jquery');

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

window.$ = window.jQuery = require('jquery');

var twitterConfig = {
    "consumerKey": "TcXJQH40easDKj5izPKwvzKgm",
    "consumerSecret": "6kkW9Ho5MQ8HdyxhRBx8Eb2cFuInaLKrmUgeEzlGUs52Qo55NL",
    "accessToken": "26480984-tMR5bRIeZYcIp3PTENw5omKeblkx7i0ujFqauO1MS",
    "accessTokenSecret": "t2M30Fi6Ttk1EP1OzXcQKUEEdD0GWlVoHCVmK5PQTp7Y6"
};

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

function loadTweet(id) {
  var obj = tweetEngine.getTweet(id);

  var tweetCount = parseInt(obj.favorite_count) + parseInt(obj.retweet_count);
  var created_at = new Date(obj.created_at);

  var panel = document.createElement('div');

  panel.className = 'panel panel-info';

  panel.setAttribute('data-count', tweetCount);

  var header = document.createElement('div');
  header.className = 'panel-heading';

  var headerHTML = '<div class="row"><div class="col-sm-3" style="vertical-align: middle;"><img class="profile_pic" src="'+obj.user.profile_image_url+'" border="0"/></div>';
  headerHTML = headerHTML + '<div class="col-sm-6" style="vertical-align: middle;"><h5>@'+ obj.user.screen_name +'</h5><small>'+ obj.user.name+'</small></div>';
  if(tweetCount > 0){
    headerHTML = headerHTML + '<div class="col-sm-3" style="vertical-align: middle;" id="' + obj.id + '-counter">';
    if(obj.favorite_count > 0){
      headerHTML = headerHTML + '<span class="badge"><div style="margin-top: 7px; display: inline-block;">&#x2b50;</div>&nbsp;'+obj.favorite_count+'</span>';
    }
    if(obj.retweet_count > 0){
      headerHTML = headerHTML + '<span class="badge"><div style="margin-top: 7px; display: inline-block;">&#x1f504;</div>&nbsp;'+obj.retweet_count+'</span>';
    }
    headerHTML = headerHTML + '</div>';
  }
  headerHTML = headerHTML + '</div>';
  header.innerHTML = headerHTML;

  var body = document.createElement('div');
  body.className = 'panel-body';
  body.innerHTML = '<p>' + obj.text + '</p>';

  var footer = document.createElement('div');
  footer.className = 'panel-footer';

  var footerHTML = '<div class="row">';
  footerHTML += '<div class="col-sm-6" align="left">'+moment(created_at).format("YYYY-MM-DD HH:mm")+'</div>';
  footerHTML += '<div class="col-sm-6" align="right"><div class="btn btn-default close">Close</div></div>';
  footerHTML += '</div>';

  footer.innerHTML = footerHTML;

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);

  var tweet = document.getElementById('tweet');
  tweet.innerHTML = '';
  tweet.appendChild(panel);

  $(".close").on( "click", function() {
    $('#tweet').html('');
  });
};

function twitterEngine(twitterApi, config, myEmitter){
   var hashtags, mentions, dataLoaded;
   var tweets = [];

   var twitter = new twitterApi.Twitter(config);

   var error = function (err, response, body) {
       console.log('ERROR [%s]', JSON.stringify(err));
   };

   function getItems (data, type) {
       //console.log('Data [%s]', data);
       var json = JSON.parse(data);

       var items = [];
       var animate = [];

       for(k in json.statuses){
         var obj = json.statuses[k];
         var created_at = new Date(obj.created_at);

         var tweetCount = parseInt(obj.favorite_count) + parseInt(obj.retweet_count);

         var element = document.createElement('div');

         element.className = 'btn btn-primary tweet';
         element.setAttribute('data-count', tweetCount);
         element.setAttribute('id', obj.id);
         element.innerHTML = '<img class="profile_pic" src="'+obj.user.profile_image_url+'" border="0"/>';

         items.push(element);
         tweets.push(obj);
       }

       return items;
   };

   function parseHashtags(data){
     hashtags = getItems(data, 'hashtag');
     loadMentions();
   };

   function parseMentions(data){
     mentions = getItems(data, 'mention');
     myEmitter.emit('dataLoaded', hashtags, mentions);
   };

   function loadMentions(){
     twitter.getSearch({'q':'@PHPSouthAfrica:) since:2016-09-01', 'count': 100}, error, parseMentions);
   };

   function loadData(){
     twitter.getSearch({'q':'#PHPJhb16:) since:2016-09-01', 'count': 100}, error, parseHashtags);
   }

   function getTweet(id){
     for(i in tweets){
       var obj = tweets[i];
       if(obj.id == id){
         return obj;
       }
     }
   }

   return {
     loadData: loadData,
     getHashtags: hashtags,
     getMentions: mentions,
     getTweet: getTweet
   }
}

const tweetEngine = twitterEngine(twitterApi, twitterConfig, myEmitter);
tweetEngine.loadData();

myEmitter.on('dataLoaded', (hashtags, mentions) => {

  var items = [];
  for(k in hashtags){
    var item = hashtags[k];
    items.push(item);
  };

  for(k in mentions){
    var item = mentions[k];
    items.push(item);
  };

  var camera, scene, renderer;
  var controls;

  var objects = [];
  var targets = { table: [], sphere: [], helix: [], grid: [] };

  $('#loader').hide();
  $('#refresh').show();
  $('#container').html('');

  init();
  animate();

  $(".tweet").on( "click", function() {
    var button = $(this)[0];
    loadTweet( button.id );
  });

  function init() {

    camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 3000;

    scene = new THREE.Scene();

    // table

    for ( var i = 0; i < items.length; i += 1 ) {
      var element = items[i];

      var object = new THREE.CSS3DObject( element );
      object.position.x = Math.random() * 4000 - 2000;
      object.position.y = Math.random() * 4000 - 2000;
      object.position.z = Math.random() * 4000 - 2000;
      scene.add( object );

      objects.push( object );

    }


    // helix

    var vector = new THREE.Vector3();

    for ( var i = 0, l = objects.length; i < l; i ++ ) {

      var phi = i * 0.175 + Math.PI;

			var object = new THREE.Object3D();

			object.position.x = 900 * Math.sin( phi );
			object.position.y = - ( i * 8 ) + 450;
			object.position.z = 900 * Math.cos( phi );

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt( vector );

      targets.helix.push( object );

    }


    //

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    document.getElementById( 'container' ).appendChild( renderer.domElement );

    //

    controls = new THREE.TrackballControls( camera, renderer.domElement );
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener( 'change', render );

    transform( targets.helix, 2000 );

    window.addEventListener( 'resize', onWindowResize, false );

  }

  function transform( targets, duration ) {

    TWEEN.removeAll();

    for ( var i = 0; i < objects.length; i ++ ) {

      var object = objects[ i ];
      var target = targets[ i ];

      new TWEEN.Tween( object.position )
        .to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

      new TWEEN.Tween( object.rotation )
        .to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
        .easing( TWEEN.Easing.Exponential.InOut )
        .start();

    }

    new TWEEN.Tween( this )
      .to( {}, duration * 2 )
      .onUpdate( render )
      .start();

  }

  function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    render();

  }

  function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    controls.update();

  }

  function render() {

    renderer.render( scene, camera );

  }

});

setInterval(function(tweetEngine){
  tweetEngine.loadData();
}, 30000, tweetEngine);

$("#refresh").on( "click", function() {
  $('#refresh').hide();
  $('#container').html('');
  $('#loader').show();

  tweetEngine.loadData();
});
