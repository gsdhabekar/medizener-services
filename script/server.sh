#!/bin/bash
sudo sed -i 's/SERVICE_IP/api.medizener.com/g' ../api/swagger/swagger.yaml &&
sudo sed -i 's/VERIFY_IP/http:\/\/www.medizener.com\/#!\/verifyEmail?token=/g' ../config/resources.js &&
sudo sed -i 's/RESET_IP/http:\/\/www.medizener.com\/#!\/reset?token=/g' ../config/resources.js &&
sudo sed -i 's/DB_PATH/mongodb:\/\/medizenerUser:#Medi_db01@127.0.0.1:27017\/medizener/g' ../config/db.js &&
#sudo sed -i 's/AGENDA_DB_PATH/medizenerUser:#Medi_db01@127.0.0.1:27017\/agenda/g' ../utils/agenda.js