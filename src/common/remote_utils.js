

define(['q'], function(Q) {
    'use strict';

    return {
	chunkString: function(str, len) {
	    return String(str).match(new RegExp('(.|[\r\n ]){1,' + len + '}', 'g'));
	},
	sanitizePath: function(path) {
	    return path.replace(/ /g, '\\ ');
	},
	range: function(lowEnd,highEnd) {
	    var arr = [],
		c = highEnd - lowEnd + 1;
	    while ( c-- ) {
		arr[c] = highEnd--
	    }
	    return arr;
	},
	testPing: function(ip) {
	    var self = this;
	    var ping = require('ping');
	    return ping.promise.probe(ip)
		.then(function (res) {
		    if (!res.alive)
			throw new String(ip + ' is not reachable.');
		    return true;
		});
	},
	testSSH: function(ip, username, key) {
	    var self = this;
	    return self.executeOnHost(['echo "hello"'], ip, username, key)
		.then(function () {
		    return true;
		})
		.catch(function (err) {
		    throw new String(username + '@' + ip + ' not SSH-able: ' + err);
		});
	},
	executeOnHost: function(cmds, ip, username, key, stderrCB) {
	    var self = this;
	    var Client = require('ssh2').Client;
	    var deferred = Q.defer();
	    var output = {
		username: username,
		key: key,
		ip: ip,
		returnCode: -1,
		signal: undefined,
		stdout: '',
		stderr: ''
	    };

	    if ( stderrCB == undefined ) {
		stderrCB = function(data) {
		    return true;
		};
	    }

	    var remote_stdout = '';
	    var remote_stderr = '';
	    cmds.push('exit\n');
	    var cmdString = cmds.join('\n');
	    try {
		var conn = new Client();
		conn.on('error', (err) => {
		    deferred.reject('Couldnt connect to ' + ip + ': ' + err);
		});
		conn.on('ready', function() {
		    conn.exec(cmdString, function(err, stream) {
			if (err) { 
			    var msg = 'SSH2 Exec error: ' + err;
			    deferred.reject(msg);
			}
			stream.on('close', function(code, signal) {
			    conn.end();
			    output.returnCode = code;
			    output.signal = signal;
			    output.stdout = remote_stdout.replace(new RegExp(username + '@.+\$','gi'), '');
			    for (var c in cmds) {
				output.stdout = output.stdout.replace(new RegExp(cmds[c], 'gi'), '');
			    }
			    output.stderr = remote_stderr;
			    deferred.resolve(output);
			}).stdout.on('data', function(data) {
			    remote_stdout += data;
			}).stderr.on('data', function(data) {
			    remote_stderr += data;
			    if (stderrCB(data)) {
				conn.end();
				deferred.reject(data);
			    }
			});
		    })
		}).connect({
		    host: ip,
		    port: 22,
		    username: username,
		    privateKey: require('fs').readFileSync(key)
		});
	    }
	    catch (err) {
		deferred.reject('Couldnt execute on ' + ip + ': '+ err);
	    }
	    return deferred.promise;
	},
	mkdirRemote: function(dir, ip, username, key) {
	    var self = this;
	    dir = self.sanitizePath(dir);
	    return self.executeOnHost(['mkdir -p ' + dir],
				      ip,
				      username,
				      key);
	},
	copyToHost: function(from, to, ip, username, key) {
	    var self = this;
	    var client = require('scp2');
	    //from = self.sanitizePath(from);
	    //to = self.sanitizePath(to);
	    var deferred = Q.defer();
	    try { 
		client.scp(from, {
		    host: ip,
		    username: username,
		    privateKey: require('fs').readFileSync(key),
		    path: to
		}, function(err) {
		    if (err)
			deferred.reject('copy to ' + ip + ' failed: '+ err);
		    else {
			deferred.resolve();
		    }
		});
	    }
	    catch (err) {
		deferred.reject('copy to ' + ip + ' failed: '+ err);
	    }
	    return deferred.promise;
	},
	copyFromHost: function(from, to, ip, username, key) {
	    var self = this;
	    from = self.sanitizePath(from);
	    to = self.sanitizePath(to);
	    var url = require('url'),
		path = require('path'),
		fs = require('fs'),
		unzip = require('unzip'),
		fstream = require('fstream'),
		child_process = require('child_process');
	    
	    var local = to;
	    var remote = username + '@' + ip + ':' + from;

	    var scp = 'scp -o StrictHostKeyChecking=no -i ' + key + ' -r ' + remote + ' ' + local;
	    
	    var deferred = Q.defer();

	    var child = child_process.exec(scp, function(err, stdout, stderr) {
		if (err) {
		    deferred.reject('copy from ' + ip + ' failed: '+err);
		}
		else {
		    deferred.resolve('copied ' + remote + ' into ' + local);
		}
	    });
	    return deferred.promise;
	},
	POST: function(host, port, path, jsonData) {
	    var http = require('http');
	    var options = {
		hostname: host, //'demo-c2wt-master',
		port: port,     //8080,
		path: path,     //'/v2/apps',
		method: 'POST',
		headers: {
		    'Content-Type': 'application/json',
		}
	    };
	    var deferred = Q.defer();

	    // TEMP
	    var _json = JSON.parse(jsonData);

	    var req = http.request(options, function(res) {
		//console.log("Requesting " + _json.id);
		res.setEncoding('utf8');
		res.on('data', function (body) {
		    deferred.resolve(body);
		});
	    });

	    req.on('error', function(e) {
		deferred.reject(e);
	    });

	    // write data to request body
	    req.write(jsonData);
	    req.end();

	    return deferred.promise;
	},
	GET: function(host, port, path) {
	    var http = require('http');
	    var options = {
		hostname: host,
		port: port,
		path: path
	    };

	    var deferred = Q.defer();

	    http.get(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (body) {
		    deferred.resolve(body);
		});
	    }).on('error', function(e) {
		deferred.reject(e);
	    });

	    return deferred.promise;
	}
	
    }
});
