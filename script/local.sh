#!/bin/bash
sudo sed -i 's/SERVICE_IP/localhost:8888/g' ../api/swagger/swagger.yaml
sudo sed -i 's/VERIFY_IP/http:\/\/localhost:3333\/#!\/verifyEmail?token=/g' ../config/resources.js &&
sudo sed -i 's/RESET_IP/http:\/\/localhost:3333\/#!\/reset?token=/g' ../config/resources.js &&
sudo sed -i 's/DB_PATH/mongodb:\/\/127.0.0.1:27017\/medizener/g' ../config/db.js &&
#sudo sed -i 's/AGENDA_DB_PATH/localhost:27017\/agenda/g' ../utils/agenda.js



#!/bin/bash
#sudo sed -i 's/SERVICE_IP/localhost:8888/g' ../api/swagger/swagger.yaml
#sudo sed -i 's/VERIFY_IP/http:\/\/localhost:3333\/#!\/verifyEmail?token=/g' ../config/resources.js &&
#sudo sed -i 's/RESET_IP/http:\/\/localhost:3333\/#!\/reset?token=/g' ../config/resources.js &&
#sudo sed -i 's/DB_PATH/mongodb:\/\/127.0.0.1:27017\/medizener/g' ../config/db.js &&
#sudo sed -i 's/AGENDA_DB_PATH/localhost:27017\/agenda/g' ../utils/agenda.js