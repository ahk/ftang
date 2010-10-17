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

      loadPlaylist: function(initialLoad) {
        $.getJSON('/playlist/load', function(data) {
          playlist = data || [];
          FTANGPlayer.renderPlayList();
          if (initialLoad) {
            FTANGPlayer.playListConfig(playItem);
          }
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
        $("#playlist_item_"+playItem).removeClass("playlist_current");
        $("#playlist_item_"+index).addClass("playlist_current");
        playItem = index;
        
        jplayer.jPlayer('setFile', playlist[playItem].mp3);
      },

      playListChange: function(index) {
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
        $.get('/playlist/delete/'+songIndex);
        $("#playlist_item_"+songIndex).remove();
        $("#playlist_remove_item_"+songIndex).remove();
        playlist.splice(songIndex, 1);

        if(playitem > songIndex) {
          playitem--;
        }

        for(var i = songIndex + 1; i <= playlist.length; i++) {
          $("#playlist_item_"+i).data( "index", i-1)
            .attr( 'id', "playlist_item_"+(i-1) );
          $("#playlist_remove_item_"+i).attr( 'id', "playlist_remove_item_"+(i-1) );
        }
      },

      showPlayList: function() {
        $('#content').css('width', '80%');
        $('#playlist').show();
      },
      
      clearPlaylist: function() {
        $('#playlist_list ul').empty();
        $.get('/playlist/clear', function(){
          playlist = [];
          FTANGPlayer.hidePlaylist();
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
  
  $(".playlist_remove").live("click", function() {
    var index = $(this).parent().data("index");
    FTANGPlayer.playListRemove(index);
    return false;
  });
  
  $(".add_album_to_playlist").live("click", function(e) {
    e.preventDefault();
    var cover = $(this).parents().filter(':first');
    var img = $(cover).find('img');
    var album = $(img).attr('album');
    var artist = $(img).attr('artist');
    $.get('/playlist/add/' + artist + '/' + album, function() {
      FTANGPlayer.loadPlaylist(false);
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
  
  loadArtists();
  FTANGPlayer.initJPlayer();
  FTANGPlayer.hidePlaylist();

});
