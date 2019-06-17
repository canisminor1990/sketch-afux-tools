import sketch from 'sketch/dom';
import Settings from 'sketch/settings';
import UI from 'sketch/ui';
import _ from 'lodash';
import fetch from 'sketch-polyfill-fetch';

const Library = sketch.Library;

const remoteLibrary = [
  'O2kR2', // Anto 输出组件
  'QxoYG', // Anto 视觉组件
  'R9nlz', // Anto 交互组件
];

export const addLibrary = context => {
  _.forEach(remoteLibrary, fileName => {
    const url = `https://client.sketch.cloud/v1/shares/${fileName}/rss`;

    Library.getRemoteLibraryWithRSS(url, (err, lib) => {
      if (err) return console.log(err);
      fetch(url)
        .then(response => response.text())
        .then(text => {
          const newVersion = text.match(/<pubDate>([^<]+?)<\/pubDate>/)[1];
          const version = Settings.settingForKey(fileName);
          const cacheLib = _.filter(
            Library.getLibraries(),
            lib => lib.name === 'Anto 输出组件' || lib.name === 'Anto 交互组件'
          );
          if (!version || version !== newVersion || cacheLib.length < 2) {
            // remove old lib
            lib.remove();
            // add new one
            Library.getRemoteLibraryWithRSS(url, (err, newlib) => {
              if (err) return console.log(err);
              Settings.setSettingForKey(fileName, newVersion);
              UI.alert(newlib.name, '组件已经更新至：' + newVersion);
            });
          }
        })
        .catch(e => console.error(e));
    });
  });
};
