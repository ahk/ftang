// documentation for this version of jplayer: http://www.happyworm.com/jquery/jplayer/0.2.5/developer-guide.htm
$(function() {
// controls for the player and the playlist
  var FTANGPlayer = function() { // called inline
    
    var playlist = [];
    var playItem = 0;
    var jplayer = $("#jquery_jplayer");
    
    var public_methods = { // public interface object
      initJPlayer: function() {
        jplayer.jPlayer({
          ready: function() { FTANGPlayer.loadPlaylist(true); }, 
          oggSupport: false,
          swfPath: 'js',
        })
        .jPlayer('onProgressChange', function(loadPercent, playedPercentRelative, playedPercentAbsolute, playedTime, totalTime) {
          var myPlayedTime = new Date(playedTime);
          var ptMin = (myPlayedTime.getUTCMinutes() < 10) ? "0" + myPlayedTime.getUTCMinutes() : myPlayedTime.getUTCMinutes();
          var ptSec = (myPlayedTime.getUTCSeconds() < 10) ? "0" + myPlayedTime.getUTCSeconds() : myPlayedTime.getUTCSeconds();
          $("#play_time").text(ptMin+":"+ptSec);

          var myTotalTime = new Date(totalTime);
          var ttMin = (myTotalTime.getUTCMinutes() < 10) ? "0" + myTotalTime.getUTCMinutes() : myTotalTime.getUTCMinutes();
          var ttSec = (myTotalTime.getUTCSeconds() < 10) ? "0" + myTotalTime.getUTCSeconds() : myTotalTime.getUTCSeconds();
          $("#total_time").text(ttMin+":"+ttSec);
        })
        .jPlayer('onSoundComplete', function() {
          FTANGPlayer.playListNext();
        });
      },

      loadPlaylist: function(updatePlayingFile) {
        $.getJSON('/playlist/load', function(data) {
          playlist = data || [];
          if(playlist.length && updatePlayingFile) FTANGPlayer.playListConfig(playItem);
          FTANGPlayer.renderPlayList();
        });
      },
    
      renderPlayList: function() {
        $('#playlist_list ul').empty();
        for (i=0; i < playlist.length; i++) {
          var song = playlist[i];
          $("#playlist_list ul").append(
            "<li id='playlist_item_" + i + "'>" + 
            '<span class="tracknum">' + song.tracknum  + '</span> : ' +
            song.name + "</li>");
          $("#playlist_item_"+i).data( "index", i )
            .append("<span class='playlist_remove'>rm</span>");
        }
        $("#playlist_item_"+playItem).addClass("playlist_current");
      },

      playListConfig: function(index) {
        if (null == index) {
          jplayer.jPlayer('setFile', null);
          $("playlist_current").removeClass("playlist_current");
          return
        }
        $("#playlist_item_"+playItem).removeClass("playlist_current");
        $("#playlist_item_"+index).addClass("playlist_current");
        playItem = index;
        
        jplayer.jPlayer('setFile', playlist[playItem].mp3);
      },

      playListChange: function(index) {
        jplayer.jPlayer('pause');
        FTANGPlayer.playListConfig(index);
        jplayer.jPlayer('play');
      },

      playListNext: function() {
        var index = (playItem+1 < playlist.length) ? playItem+1 : 0;
        FTANGPlayer.playListChange(index);
      },

      playListPrev: function() {
        var index = (playItem-1 >= 0) ? playItem-1 : playlist.length-1;
        FTANGPlayer.playListChange(index);
      },

      playListRemove: function(songIndex) {
        function removeItem () {
          $("#playlist_item_"+songIndex).remove();
          $("#playlist_remove_item_"+songIndex).remove();
          playlist.splice(songIndex, 1);
        }

        if (playItem == songIndex) {
          jplayer.jPlayer('pause');
          var nextTrack;
          if (playItem == playlist.length-1) {
            nextTrack = playItem - 1;
          } else {
            nextTrack = songIndex + 1;
          }

          // we may be the last song, and have no song left to set up
          if (!playlist[nextTrack]) {
            nextTrack = null;
          }
          FTANGPlayer.playListConfig(nextTrack);
        }
  
        if(playItem > songIndex) {
          playItem--;
        }

        removeItem();
        for(var i = songIndex + 1; i <= playlist.length; i++) {
          var songEl = $("#playlist_item_"+i)
          songEl.data( "index", i-1)
            songEl.attr( 'id', "playlist_item_"+(i-1) );
          $("#playlist_remove_item_"+i).attr( 'id', "playlist_remove_item_"+(i-1) );
          if(i == playItem) {
            songEl.addClass("playlist_current");
          }
        }

        $.get('/playlist/delete/'+songIndex);

      },

      showPlayList: function() {
        $('#content').css('width', '80%');
        $('#playlist').show();
      },
      
      clearPlaylist: function() {
        jplayer.jPlayer('pause');
        FTANGPlayer.hidePlaylist();
        $.get('/playlist/clear', function(){
          playlist = [];
          playItem = 0;
          FTANGPlayer.playListConfig(null);
          $('#playlist_list ul').empty();
        });
      },
    
      hidePlaylist: function() {
        $('#content').css('width', '100%');
        $('#playlist').hide();
      },
    
      togglePlaylistVisibility: function() {
        if( $('#playlist').is(":hidden") == true ) {
          FTANGPlayer.showPlayList();
        } else {
          FTANGPlayer.hidePlaylist();
        }
      }
    };

    return public_methods;
  }();

// page loady one time stuff, lots of default event handling

  function loadArtists() {
    $.get( '/artists', function(data) {
      $('#content').html(data);
      $('#tiles ul').listnav({showCounts: false});
    });
  }
  
  function appendPlaylistAddButtons(cover) {
    $('#content .add_album_to_playlist').remove();
    $('#content .view_songs_in_album').remove();
    $(cover).append($('#add_album_to_playlist').html());
  }

  function createAlbumMouseoverTriggers() {
    $('.album').mouseover(function(){
      appendPlaylistAddButtons(this);
      resetCoverMouseoverTriggers(this);
    });
  }

  function resetCoverMouseoverTriggers(cover) {
    $('.album').unbind();
    createAlbumMouseoverTriggers();
    $(cover).unbind();
  }
  
  $('#playlist_list li').live("mouseover", function() {
      if (FTANGPlayer.playItem != $(this).data("index")) {
        $(this).addClass("playlist_hover");
      }
    }
  );
  
  $('#playlist_list li').live("mouseout", function() {
      $(this).removeClass("playlist_hover");
    }
  );
  
  $('#playlist_list li').live("click", function() {
    var index = $(this).data("index");
  	FTANGPlayer.playListChange(index);
  });
  
  $(".playlist_remove").live("click", function(e) {
    var index = $(this).parent().data("index");
    FTANGPlayer.playListRemove(index);
    return false;
  });
  
  $(".add_album_to_playlist").live("click", function(e) {
    var cover = $(this).parents().filter(':first');
    var img = $(cover).find('img');
    var album = $(img).attr('album');
    var artist = $(img).attr('artist');
    $.get('/playlist/add/' + artist + '/' + album, function() {
      // don't reload the file in the player if we already have some
      reloadFile = playlist.length ? false : true;
      FTANGPlayer.loadPlaylist(reloadFile);
      FTANGPlayer.showPlayList();
    });
  });

  $(".tiles a").live("click", function(e) {
    $("#content").html($('#loading').html());
    e.preventDefault();
    var artist = $.trim($(this).text());
    $.get( $(this).attr('href'), function(data) {
      $('#content').html(data);
      $('#header_artist').show();
      $('#header_artist h1').text(artist);
      createAlbumMouseoverTriggers();
    });
  });

  $(".home_nav").live("click", function() {
    $("#content").html($('#loading').html());
    loadArtists();
    $('#header_artist h1').text("");
    $('#header_artist').hide();
    $('#header_album h1').text("");
    $('#header_album').hide();
  });
  
  $('#clear_playlist').live('click', function(e) {
    FTANGPlayer.clearPlaylist();
  });
  
  $('#playlist_list ul li').live("mouseover", function() {
    $(this).find("span.playlist_remove").show();
  });
  
  $('#playlist_list ul li').live("mouseout", function() {
    $(this).find("span.playlist_remove").hide();
  });
  
  $('#toggle_playlist').live('click', function() {
    FTANGPlayer.togglePlaylistVisibility();
  });

  $("#ctrl_prev").live('click', function() {
  	FTANGPlayer.playListPrev();
   	return false;
  });

  $("#ctrl_next").live('click', function() {
  	FTANGPlayer.playListNext();
    return false;
  });
  
  // Try to make it feel snappier ...
  setTimeout(function(){
    loadArtists();
    FTANGPlayer.initJPlayer();
    FTANGPlayer.hidePlaylist();
  },0);

});
