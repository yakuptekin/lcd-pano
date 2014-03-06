const gunler = [ "Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi" ];
const aylar = [ "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara" ];

var alarmsayisi = 0;
var flipflopsayisi = 0;
var pano = chrome.app.window.current();
var ayarlar = new Object();

chrome.contextMenus.removeAll(function() {
  chrome.contextMenus.create({ title: 'Tam Ekran', id: 'menuTamEkran', contexts: ['all'] , type: 'checkbox', checked: pano.isFullscreen()});
  chrome.contextMenus.create({ title: 'Ayraç', id: 'menuAyrac', contexts: ['all'], type: 'separator' });
  chrome.contextMenus.create({ title: 'Ayarlar', id: 'menuAyarlar', contexts: ['all'] });
  chrome.contextMenus.create({ title: 'Küçült', id: 'menuKucult', contexts: ['all'] });
  chrome.contextMenus.create({ title: 'Çıkış', id: 'menuCikis', contexts: ['all'] });
});

chrome.contextMenus.onClicked.addListener(function(item) {
  switch (item.menuItemId) {
    case 'menuAyarlar':
      chrome.app.window.create('ayarlar.html', {
        bounds: { width: 1000, height: 610 }, minWidth: 1000, minHeight: 610, id: 'ayarlar'
        }, function (w) {
        ayarlar = w;
      });
    break;
    case 'menuKucult':
      if(ayarlar.minimize != undefined) ayarlar.minimize();
      pano.minimize();
    break;
    case 'menuTamEkran':
      pano.isFullscreen() ? pano.restore() : pano.fullscreen();
    break;
    case 'menuCikis':
      if(ayarlar.close != undefined) ayarlar.close();
      pano.close();
    break;
  }
});

chrome.runtime.onMessage.addListener(function (mesaj, sender, sendResponse) {
  switch (mesaj) {
    case 'restart':
      pano.close();
      sendResponse({'result': 'closed'});
    break;
  }
});

$(window).resize(function() {
  zoomSeviyesiniAyarla();
  chrome.contextMenus.update("menuTamEkran", { checked: pano.isFullscreen() });
});

function saattenDakikaya (s) {
 var c = s.split(':');
 return parseInt(c[0]) * 60 + parseInt(c[1]);
}

function sifirEkle (sayi) {

  return ("00"+sayi).slice(-2);
}

function dakikadanSaate (dakika) {
  var ss = Math.floor(dakika / 60);
  var dd = dakika % 60;
  return sifirEkle(ss) + ':' + sifirEkle(dd);
}

function ikiSaatOrtası (buyuk, kucuk) {

  return dakikadanSaate(saattenDakikaya(buyuk) - Math.floor((saattenDakikaya(buyuk) - saattenDakikaya(kucuk)) / 2));
}

function ikiSaatFarkı (buyuk, kucuk) {

  return (saattenDakikaya(buyuk) - saattenDakikaya(kucuk));
}

function kaydir (innerID, containerID, sure) {
  var divh = $('#'+containerID).height();
  var tabloh = $('#'+innerID).height();
  var fark = divh - tabloh;

  if (fark < -10) {
    var miktar = 0, step = 0, i = 1, asagi = true;
    
    do {
      miktar = (-fark) / i++;
    } while (miktar > divh);
    
    setInterval(function () {
      if (asagi) {
        if (fark-step < -miktar) step-=miktar;
        else { step = fark; asagi = !asagi; } 
      }
      else {
        if (step < -miktar) step+=miktar;
        else { step = 0;    asagi = !asagi; }
      }
      document.getElementById(innerID).style.top = step+'px';
    }, sure);
  }
}

function tabloyaEkle (tabloid, hucre1, hucre2, genislik1) {
  var tablo = document.getElementById(tabloid);
  var tr = document.createElement('tr');
  var td1 = document.createElement('td');
  var td2 = document.createElement('td');
  td1.style.cssText = 'width: '+genislik1+'%; text-align: center; font-weight: bold;';
  td2.style.cssText = 'width: '+(100-genislik1)+'%;';
  td1.innerHTML = hucre1;
  td2.innerHTML = hucre2;
  tr.appendChild(td1);
  tr.appendChild(td2);
  tablo.appendChild(tr);
}

function isImage (dosya) {

  return (/\.(gif|jpg|jpeg|tiff|png|bmp|svg|xbm|webp)$/i).test(dosya.name.toLowerCase());
}

function slaytHata (mesaj) {
  var slider = document.getElementById('slider');
  var hatadiv = document.createElement('div');
  hatadiv.className = 'slayt_hata';
  hatadiv.innerHTML = mesaj;
  slider.style.backgroundImage = 'none';
  slider.appendChild(hatadiv);
}

function flipflop(sol_moduller, sag_moduller) {
  var flipcontrol1 = ['', 'flip1'];
  var flipcontrol2 = ['', 'flip2'];
  switch (sol_moduller) {
    case 'ikiside': colwrap1.className = flipcontrol1[flipflopsayisi%2]; break;
    case 'nobpersonel': colwrap1.className = flipcontrol1[0]; break;
    case 'ozel': colwrap1.className = flipcontrol1[1]; break;
  }
  switch (sag_moduller) {
    case 'ikiside': colwrap2.className = flipcontrol2[flipflopsayisi%2]; break;
    case 'havahaber': colwrap2.className = flipcontrol2[0]; break;
    case 'dersprog': colwrap2.className = flipcontrol2[1]; break;
  }
}

function zoomSeviyesiniAyarla () {
  var g = $(window).width();
  var y = $(window).height();
  var z = y / 675;
  if (z * 1200 > g)
    z = g / 1200;
  document.getElementById('main').style.cssText = 'zoom: '+z.toFixed(2)+' !important;';
}

function havaDurumuHaberGuncelle (degerler) {
  $.ajax({
    url : encodeURI('http://api.wunderground.com/api/' + degerler.apikey + '/geolookup/conditions/lang:TR/q/IA/' + degerler.adres + '.json'),
    dataType : "json",
    success : function (response) {
      if (response.response.error) {
        hava_durumu_icerik.innerHTML = "";
        var divhata = document.createElement('div');
        divhata.style.cssText = 'padding: 10px; text-align: center;';
        divhata.innerHTML = 'HATA: Hava durumu bilgisi alınamıyor. Uygulamayı ilk kez çalıştırıyorsanız'
        + 'lütfen sağ tık menüsünden Ayarlar\'a girip wunderground.com API anahtarınızı ve il-ilçe bilginizi giriniz.';
        hava_durumu_icerik.appendChild(divhata);
      }
      else {
        var saat = new Date().getHours();
        var gecegunduz = (saat >= 6 && saat < 18) ? 'hava_gunduz' : 'hava_gece';
        weatherItem.style.cssText = "background-position: 10px center; background-image: url('img/" + gecegunduz + "/" + response.current_observation.icon + ".png');";
        weatherCity.innerHTML = response.location.city;
        weatherTemp.innerHTML = response.current_observation.temp_c + "&deg;C";
      }
    },
    error: function (xhr, ajaxOptions, thrownError) {
      hava_durumu_icerik.innerHTML = "";
      var divhata = document.createElement('div');
        divhata.style.cssText = 'padding: 10px; text-align: center;';
        divhata.innerHTML = 'HATA: Hava durumu bilgisi alınamıyor. Lütfen internet bağlantınızı kontrol edin.';
        hava_durumu_icerik.appendChild(divhata);
    }
  });
  var trthbr = document.getElementById('trthaber');
  trthbr.src = 'http://www.trthaber.com/sitene-ekle/'+ degerler.haber_kategorisi +'/?haberSay=5&renk=a&baslik=0&resimler=1';
  
}

function ders_programi_tablo_olustur (degerler, devre, saatmetni, bugun) {
  if(bugun >= 1 && bugun <= 5) {

  for (var ders = 1; ders <= degerler.gunluk_ders_sayisi; ders++) {
    var basla_saati = degerler.ders_saatleri[devre][sifirEkle(ders)].basla_saati;
    var bitis_saati = degerler.ders_saatleri[devre][sifirEkle(ders)].bitis_saati;
    var sonraki_bas_saati = (ders == degerler.gunluk_ders_sayisi) ? sonraki_bas_saati = degerler.ders_saatleri[devre]['01'].basla_saati : degerler.ders_saatleri[devre][sifirEkle(ders+1)].basla_saati;

    if (saatmetni >= basla_saati && saatmetni < bitis_saati) {
      suan_kalan.innerHTML = 'Şu an <b>'+ders+'.</b> dersteyiz.<br>Teneffüs ziline <b>'+ ikiSaatFarkı(bitis_saati, saatmetni) +'</b> dakika var.';
      programi_getir(degerler, devre, ders, bugun);
      break;
    }
    if (saatmetni >= bitis_saati && saatmetni < sonraki_bas_saati) {
      suan_kalan.innerHTML = 'Şu an teneffüsteyiz.<br><b>'+(ders+1)+'.</b> ders ziline <b>'+ ikiSaatFarkı(sonraki_bas_saati, saatmetni) +'</b> dakika var.';
      programi_getir(degerler, devre, ders, bugun);
      break;
    } 
  }
  }
  else {
    suan_kalan.innerHTML = '☺ HAFTA SONU ☺';
  }
}

function programi_getir (degerler, devre, ders, bugun) {
  if(bugun >= 1 && bugun <= 5) {
    ders_programi_tablo.innerHTML = "";
    var gunler2 = ['','pzt','sal','crs','per','cum','cmt','paz'];
    var suanki_ders_programi = degerler.ders_programi[gunler2[bugun]][devre][sifirEkle(ders)];
    var siniflardizi = degerler.siniflar.split(',');
    //console.log(gunler2[bugun]);

    for (var sinif in siniflardizi) {
      if(suanki_ders_programi != undefined && suanki_ders_programi[siniflardizi[sinif]] != undefined) {
        tabloyaEkle('ders_programi_tablo', siniflardizi[sinif], suanki_ders_programi[siniflardizi[sinif]], 18);
      }
    }
      kaydir('ders_programi_tablo', 'suanki_dersler', 10000);
  }
  else {
    suan_kalan.innerHTML = '☺ HAFTA SONU ☺';
  }
}

function metindenSaate (saat) {
  var dat = new Date();
  var time = saat.split(/\:|\-/g);
  dat.setHours(time[0]);
  dat.setMinutes(time[1]);
  return dat;
}

function tarihSaatDersGuncelle (degerler) {

  var tarihsaat = new Date();
  var tarihmetni = tarihsaat.getDate() + " " + aylar[tarihsaat.getMonth()] + " " + tarihsaat.getFullYear() + ", " + gunler[tarihsaat.getDay()];
  var saatmetni = tarihsaat.toTimeString().substr(0,5);
  var bugun = tarihsaat.getDay();
  var ders_saatleri = {};
  var bugunun_ders_programi = {};
  var suanki_ders = null;

  //saatmetni = "14:10";
  //bugun = 2;

  tarih.innerHTML = tarihmetni;
  saat.innerHTML = saatmetni;
  var devre = 'sabah';
  //console.log(degerler.ogretim_turu );
  if (degerler.ogretim_turu == 'ikili') {

    if (saatmetni > degerler.ders_saatleri['sabah'][sifirEkle(degerler.gunluk_ders_sayisi)].bitis_saati) {
      devre = 'oglen';
    }
    //console.log((metindenSaate(degerler.ders_saatleri['sabah']['01'].basla_saati)-10).toTimeString().substr(0,5));
    if (saatmetni < degerler.ders_saatleri['sabah']['01'].basla_saati) {
      suan_kalan.innerHTML = '☺ GÜNAYDIN ☺<br>Ders ziline <b>'+ ikiSaatFarkı(degerler.ders_saatleri['sabah'][sifirEkle('01')].basla_saati, saatmetni) +'</b> dakika var.';
      programi_getir(degerler, 'sabah', 1, bugun);
    }
    else if (saatmetni >= degerler.ders_saatleri['sabah'][sifirEkle(degerler.gunluk_ders_sayisi)].bitis_saati && saatmetni < degerler.ders_saatleri['oglen'][sifirEkle('01')].basla_saati) {
      suan_kalan.innerHTML = 'Şu an öğle arasındayız.<br><b>1.</b> ders ziline <b>'+ ikiSaatFarkı(degerler.ders_saatleri['oglen'][sifirEkle('01')].basla_saati, saatmetni) +'</b> dakika var.';
      programi_getir(degerler, 'oglen', 1, bugun);
    }
    else if (saatmetni >= degerler.ders_saatleri['oglen'][sifirEkle(degerler.gunluk_ders_sayisi)].bitis_saati) {
      suan_kalan.innerHTML = '☺ İYİ AKŞAMLAR ☺';
      programi_getir(degerler, 'oglen', degerler.gunluk_ders_sayisi, bugun);
    }
    else {
      ders_programi_tablo_olustur(degerler, devre, saatmetni, bugun);
    }  
  }
  else {
    if (saatmetni < degerler.ders_saatleri['sabah']['01'].basla_saati) {
      suan_kalan.innerHTML = '☺ GÜNAYDIN ☺<br>Ders ziline <b>'+ ikiSaatFarkı(degerler.ders_saatleri['sabah'][sifirEkle('01')].basla_saati, saatmetni) +'</b> dakika var.';
      programi_getir(degerler, 'sabah', 1, bugun);
    }
    else if (saatmetni >= degerler.ders_saatleri['sabah'][sifirEkle(degerler.gunluk_ders_sayisi)].bitis_saati) {
      suan_kalan.innerHTML = '☺ İYİ AKŞAMLAR ☺';
      programi_getir(degerler, 'sabah', degerler.gunluk_ders_sayisi, bugun);
    }
    else {
      ders_programi_tablo_olustur(degerler, 'sabah', saatmetni, bugun);
    }  
  }
}

function icerigiDoldur (degerler) {

  flipflop(degerler.sol_moduller, degerler.sag_moduller);
  
  okul_adi.innerText = degerler.okul_adi;
  kayan_yazi.innerText = degerler.duyuru;
  nobetci_per_icerik.style.fontSize = degerler.nob_per_punto + 'px';
  suanki_dersler.style.fontSize = degerler.ders_prog_punto + 'px';
  ozelmodul_baslik_text.innerText = degerler.ozelmodulbaslik;
  ozelmodul_icerik.innerHTML = degerler.ozelmodulhtml;

  var pattern = '';
  var bugun = new Date().getDay();

  if (degerler.ogretim_turu == 'ikili') {
    var sabahoglen = (new Date().toTimeString().substr(0,5) < degerler.nobet_degisim_saati) ? 'sabah' : 'oglen';
    pattern = 'nobetliste_g' + bugun + '_' + sabahoglen + '_';
  }
  else {
    pattern = 'nobetliste_g' + bugun + '_tamgn_';
  }
  var kategoriler = degerler.nobet_kategorileri.split(',');
    
  nobetci_per_tablo.innerHTML = "";
  var i = 0;
  for (var j in degerler) {
    if (j.substr(0,20) == pattern) {
      var kategori = kategoriler[i++];
      var nobetciler = degerler[j].replace(',','<br />');
      tabloyaEkle('nobetci_per_tablo', kategori, nobetciler, 30);

    }
  }

  $('#kayan_yazi').marquee({
    duration: degerler.kayan_yazi_hizi * 1000,  
    direction: 'left'  
  });

  kaydir('nobetci_per_tablo', 'nobetci_per_icerik', 10000);  
  kaydir('ozelmodul_icerik', 'ozelmodul_icerik_wrap2', 10000); 
}

function yenile () {
  alarmsayisi++;
  chrome.storage.local.get(function (degerler) {
    tarihSaatDersGuncelle(degerler);
    icerigiDoldur(degerler);
    if (alarmsayisi % 3 == 0) {
      havaDurumuHaberGuncelle(degerler);
    }
  });
}

function sayaclariVeOlaylariKur (degerler) {

  var suan = new Date();
  var kalan = 60000-suan.getSeconds()*1000;

  setTimeout(function () {
    yenile();
    setInterval(function () {
      yenile();
    }, 60000);
  }, kalan);
  
  setInterval(function () {
	 flipflopsayisi++;
	 flipflop(degerler.sol_moduller, degerler.sag_moduller);
  }, degerler.sureli_gosterim_hizi * 1000);

}

function slaytiOlustur (degerler) {
  var slider = document.getElementById('slider');
  slider.innerHTML = "";
  chrome.mediaGalleries.getMediaFileSystems({ interactive : 'if_needed' }, function (fs) {
    if (fs.length > 0) {
      var fsIndex = 0, galeriIndex = 0;
      var resimler = new Array();
      var dosyalariOku = function () {
        if (fsIndex < fs.length) {
          var dir_reader = fs[fsIndex].root.createReader();
          dir_reader.readEntries(function(galeri) {
            if(galeri.length > 0) {
              var nesne = galeri[galeriIndex];
              if(nesne.isFile && isImage(nesne)) {
                nesne.file(function(f) {
                  var reader = new FileReader();
                  reader.onloadend = function() {
                    var resim = new Image();
                    resim.alt = f.name;
                    resim.src = this.result;
                    resimler.push(resim);
                    if (++galeriIndex >= galeri.length) { 
                      galeriIndex = 0;
                      fsIndex++;
                    }
                    dosyalariOku();
                  };
                  reader.readAsDataURL(f);
                });
              }
              else {
                if (++galeriIndex >= galeri.length) { 
                  galeriIndex = 0;
                  fsIndex++;
                }
                dosyalariOku();
              }
            }
            else {
              slaytHata('SEÇTİĞİNİZ KOLEKSİYONDA RESİM BULUNAMADI.');
            }
          });
        } else {
          fsIndex = 0;
          galeriIndex = 0;
          if(resimler.length > 0) {
            slider.style.backgroundImage = 'none';
            for (var i in resimler) {
              var li = document.createElement('li');
              li.appendChild(resimler[i]);
              slider.appendChild(li);
            }
            resimler = new Array();
            $('#slider').slicebox({
              orientation : 'r',
              cuboidsRandom : true,
              maxCuboidsCount : degerler.slayt_cuboid,
              autoplay : true,
              interval: degerler.slayt_hizi * 1000,
            });
          }
          else {
            slaytHata('SEÇTİĞİNİZ KOLEKSİYONDA RESİM BULUNAMADI.');
          }
        }
      };
      dosyalariOku();
    }
    else {
      slaytHata('SLAYT OLARAK GÖRÜNTÜLENMEK ÜZERE HİÇBİR RESİM KOLEKSİYONUNA ERİŞİM İZNİ VERMEDİNİZ.<br /><br/>'
      + 'Lütfen ayarlardan "Slayt Resimlerini Seç/Değiştir" yoluyla gerekli izinleri sağlayınız.');
    }
  });
}

$(document).ready(function () {

  chrome.storage.local.get(function (degerler) {

    //console.log(degerler);
    zoomSeviyesiniAyarla();
    icerigiDoldur(degerler);
    tarihSaatDersGuncelle(degerler);
    havaDurumuHaberGuncelle(degerler);
    slaytiOlustur(degerler);
    sayaclariVeOlaylariKur(degerler);

  });

});