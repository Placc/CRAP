package main

import (
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"storage/tls_server/tls"
)

//MapRootV1 as specified in trillian/types/maproot.go
type MapRootV1 struct {
	RootHash       []byte `tls:"minlen:0,maxlen:128"`
	TimestampNanos uint64
	Revision       uint64
	Metadata       []byte `tls:"minlen:0,maxlen:65535"`
}

//MapRoot as specified in trillian/types/maproot.go
type MapRoot struct {
	Version tls.Enum   `tls:"size:2"`
	V1      *MapRootV1 `tls:"selector:Version,val:1"`
}

//LogRootV1 as specified in trillian/types/logroot.go
type LogRootV1 struct {
	TreeSize       uint64
	RootHash       []byte `tls:"minlen:0,maxlen:128"`
	TimestampNanos uint64
	Revision       uint64
	Metadata       []byte `tls:"minlen:0,maxlen:65535"`
}

//LogRoot as specified in trillian/types/logroot.go
type LogRoot struct {
	Version tls.Enum   `tls:"size:2"`
	V1      *LogRootV1 `tls:"selector:Version,val:1"`
}

//Unmarshal tls-serialized byte arrasy of MapRoot or LogRoot
func Unmarshal(typ string, bytes []byte) ([]byte, error) {
	if typ == "MAP" {
		var mapRoot MapRoot
		if _, err := tls.Unmarshal(bytes, &mapRoot); err != nil {
			return nil, err
		}

		return json.Marshal(mapRoot)
	}

	var logRoot LogRoot
	if _, err := tls.Unmarshal(bytes, &logRoot); err != nil {
		return nil, err
	}

	return json.Marshal(logRoot)
}

func rootHandler(w http.ResponseWriter, r *http.Request) {
	objType := r.URL.Query()["type"][0]
	hexString := r.URL.Query()["bytes"][0]
	bytes, err := hex.DecodeString(hexString)

	if err != nil {
		fmt.Println("Error decoding bytes param: ", err)
		w.WriteHeader(400)
		return
	}

	res, err := Unmarshal(objType, bytes)

	if err != nil {
		fmt.Println("Error unmarshalling root: ", err)
		w.WriteHeader(400)
		return
	}
	w.Write(res)

}

func main() {
	http.HandleFunc("/", rootHandler)
	fmt.Println("Listening on port 8082 for route '/'...")
	http.ListenAndServe(":8082", nil)
}
