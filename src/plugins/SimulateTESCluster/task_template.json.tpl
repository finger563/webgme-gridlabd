{  
  "id": "/{{ federateGroupName }}/{{ federateName }}",
  "cmd": "/bin/sh {{{ dockerExecuteScript }}}",
  "cpus": {{ cpu }},
  "mem": {{ mem }},
  "instances": 1,
  "container": {
    "type": "DOCKER",
    "docker": {
      "image": "docker.vulcan.isis.vanderbilt.edu/{{{ dockerImageName }}}:{{ dockerImageTag }}",
      "network": "BRIDGE",
      "parameters": [
        { "key": "hostname", "value": "{{ dockerHostName }}" },
        { "key": "add-host", "value": "marathon:{{ marathonUrl }}" },
        { "key": "add-host", "value": "inputfiles_host:{{ inputfilesServerHost }}" },
        { "key": "volume-driver", "value": "nfs" },
        { "key": "env", "value": "WEAVE_CIDR=net:{{ weaveNet }}/24" },
        { "key": "env", "value": "FEDERATION_GROUP={{ federateGroupName }}" },
        { "key": "env", "value": "INPUTFILES_PORT={{ inputfilesServerPort }}" },
        { "key": "env", "value": "INPUTFILES_LIST={{{ inputfilesList }}}" }
      ]
    },
    "volumes": [
            {
                "containerPath": "/root/Projects/c2wt/log",
                "hostPath": "{{{ dockerVolumeLogPath }}}",
                "mode": "RW"
            }
        ]
  },
  "uris":  [
      "file:///etc/docker.tar.gz"
  ]
}