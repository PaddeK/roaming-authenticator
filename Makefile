
b:
	go fmt
	go build -o roaming-authenticator

usefull:
	go get github.com/kardianos/govendor

run:	b r

c:
	rm -f sample/*.log

h:	b
	./roaming-authenticator --help

r:	c
	./roaming-authenticator server junk

rv:	c
	./roaming-authenticator server junk --verbose --multi-log

rvv:	c
	./roaming-authenticator server junk --be-very-verbose --multi-log 

fresh:	b c
	rm -f junk/config.json junk/roaming-authenticator.log
	./roaming-authenticator fresh junk --certs=./sample-certs
	cat junk/config.json

reg:	b c
	./roaming-authenticator stdio junk register --be-very-verbose --multi-log < registration-jack.json
	./roaming-authenticator stdio junk register --be-very-verbose --multi-log < registration-jill.json
	cat junk/users.json

sign:	b c
	@#./roaming-authenticator stdio junk sign --verbose --multi-log < sign1.json
	@./roaming-authenticator stdio junk sign --be-very-verbose --multi-log < sign1.json
	@#./roaming-authenticator stdio junk sign --verbose --multi-log < sign2.json
	@./roaming-authenticator stdio junk sign --be-very-verbose --multi-log < sign2.json

