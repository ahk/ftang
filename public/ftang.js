// documentation this version of jplayer: http://www.happyworm.com/jquery/jplayer/0.2.5/developer-guide.htm

$( function() {  
  $('#toggle_playlist').live('click', function(e) {
    $('#playlist').toggle();
  });
  
  var load_jplayer = function init_jplayer (playlist) {
    var playItem = 0;
    var myPlayList = playlist;
    
    $("#jquery_jplayer").jPlayer({
      ready: function() {
        $('#playlist_list ul').empty();
        displayPlayList();
        playListInit(false); // Parameter is a boolean for autoplay.
      },
      oggSupport: false
    })
    .jPlayerId("play", "player_play")
    .jPlayerId("pause", "player_pause")
    .jPlayerId("stop", "player_stop")
    .jPlayerId("loadBar", "player_progress_load_bar")
    .jPlayerId("playBar", "player_progress_play_bar")
    .jPlayerId("volumeMin", "player_volume_min")
    .jPlayerId("volumeMax", "player_volume_max")
    .jPlayerId("volumeBar", "player_volume_bar")
    .jPlayerId("volumeBarValue", "player_volume_bar_value")
    .onProgressChange( function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
      var myPlayedTime = new Date(playedTime);
      var ptMin = (myPlayedTime.getUTCMinutes() < 10) ? "0" + myPlayedTime.getUTCMinutes() : myPlayedTime.getUTCMinutes();
      var ptSec = (myPlayedTime.getUTCSeconds() < 10) ? "0" + myPlayedTime.getUTCSeconds() : myPlayedTime.getUTCSeconds();
      $("#play_time").text(ptMin+":"+ptSec);

      var myTotalTime = new Date(totalTime);
      var ttMin = (myTotalTime.getUTCMinutes() < 10) ? "0" + myTotalTime.getUTCMinutes() : myTotalTime.getUTCMinutes();
      var ttSec = (myTotalTime.getUTCSeconds() < 10) ? "0" + myTotalTime.getUTCSeconds() : myTotalTime.getUTCSeconds();
      $("#total_time").text(ttMin+":"+ttSec);
    })
    .onSoundComplete( function() {
      playListNext();
    });

    $("#ctrl_prev").click( function() {
      playListPrev();
      return false;
    });

    $("#ctrl_next").click( function() {
      playListNext();
      return false;
    });

    function displayPlayList() {
      for (i=0; i < myPlayList.length; i++) {
        $("#playlist_list ul").append("<li id='playlist_item_"+i+"'>"+ myPlayList[i].name +"</li>");
        $("#playlist_item_"+i).data( "index", i ).hover(
          function() {
            if (playItem != $(this).data("index")) {
              $(this).addClass("playlist_hover");
            }
          },
          function() {
            $(this).removeClass("playlist_hover");
          }
        ).click( function() {
          var index = $(this).data("index");
          if (playItem != index) {
            playListChange( index );
          } else {
            $("#jquery_jplayer").play();
          }
        });
        
        $("#playlist_item_" + i).append("<span id='playlist_remove_item_"+i+"' class='playlist_remove'>"+ 'rm' +"</span>");
        $("#playlist_remove_item_"+i).click( function() {
          var index = $(this).attr('id').split('_').pop();
          playListRemove(index);
          return false;
        });
      }
    }

    function playListInit(autoplay) {
      if(autoplay) {
        playListChange( playItem );
      } else {
        playListConfig( playItem );
      }
    }

    function playListConfig( index ) {
      $("#playlist_item_"+playItem).removeClass("playlist_current");
      $("#playlist_item_"+index).addClass("playlist_current");
      playItem = index;
      $("#jquery_jplayer").setFile(myPlayList[playItem].mp3, myPlayList[playItem].ogg);
    }

    function playListChange( index ) {
      playListConfig( index );
      $("#jquery_jplayer").play();
    }

    function playListNext() {
      var index = (playItem+1 < myPlayList.length) ? playItem+1 : 0;
      playListChange( index );
    }

    function playListPrev() {
      var index = (playItem-1 >= 0) ? playItem-1 : myPlayList.length-1;
      playListChange( index );
    }
    
    function playListRemove(song) {
      $.get('/playlist/remove/'+song);
      //kill the song element
      $("#playlist_item_"+song).remove();
      $("#playlist_remove_item_"+song).remove();
      //fill in gaps in list order
      for(var i = song; i < $(myPlayList).size(); i++) {
        $("#playlist_item_"+i).attr( 'id', "playlist_item_"+(i-1) );
        $("#playlist_remove_item_"+i).attr( 'id', "playlist_remove_item_"+(i-1) );
      }
      //remove from playlist
      myPlayList.splice(song, 1);
      //decrement playItem if index of removed item > playItem
      if(playItem > song) {
        playItem--;
      }
    }
  };
  
  var load_artists = function() {
    $.get( '/artists', function(data) {
      $('#content').html(data);
      $('#tiles ul').listnav({showCounts: false});
    });
  };
  
  var load_playlist = function() {
    $.getJSON('/playlist/load', function(data) {
      load_jplayer(data);
    });
  };
  
  $(".cover").live("click", function(e) { //add album to playlist
    e.preventDefault();
    var artist = $('#header_artist h1').text();
    var album = $(this).text().trim(" ");
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $.get("/playlist/add/" + artist + "/" + album, function() {
        load_playlist();
      });
    });
  }).live("mouseover", function(){
    $(this).parents().filter(':first').append("<span class='add_album_to_playlist'>+ Add album to playlist</span>");
  }).live("mouseout", function(){
    $(this).parents().filter(':first').find('.add_album_to_playlist').remove();
  });

  $(".tiles a").live("click", function(e){
    e.preventDefault();
    var artist = $(this).text().trim(" ");
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $('#header_artist').show();
      $('#header_artist h1').text(artist);
    });
  });

  $(".home_nav").live("click", function() {
    load_artists();
    $('#header_artist h1').text("");
    $('#header_artist').hide();
    $('#header_album h1').text("");
    $('#header_album').hide();
  });
  
  $('#clear_playlist').live('click', function(e) {
    $.get('/playlist/clear', function(){
      $('#playlist_list ul').empty();
      load_playlist();
    });
  });
  
  
  $('#playlist_list ul li').live("mouseover", function(){
    $(this).find("span").filter(":first").show();
  })
  
  $('#playlist_list ul li').live("mouseout", function(){
    $(this).find("span").filter(":first").hide();
  });
  
  load_artists();
  load_playlist();
  
  try {
  _uacct = "UA-9156272-1";
  urchinTracker();
  } catch(err) {}
});