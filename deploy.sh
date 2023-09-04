#!/bin/bash

#-- 설정 부분 시작 --
USER=ubuntu
APP_VERSION=$1
APP_NAME=viewus-wp-youtube
APP_PORT=8080
APP_CONTAINER_INNER_PORT=3000
DELETE_CONTAINER_IMAGE=true
DOCKER_FILE=Dockerfile
#-- 설정 부분 끝 --

# 도움말
if [ "$#" -eq 0 ] || [ "$1" == "-h" ] || [ "$1" == "help" ] || [ "$1" == "--help" ] || [ "$1" == "-help" ] || [ "$1" == "man" ]
then
    echo "deploy [version] [delete_container_image(true:false)]"
    echo "delete_container_image is not require(defualt:ture)"
    exit 0
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] == ${APP_NAME} Podman Deploy Start =="

if [ "$#" -eq 2 ] && [ "$2" == "false" ]
then
    DELETE_CONTAINER_IMAGE=$2
fi

function validate_exit(){
    if [ "$1" == "Fail" ]
    then
	    echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] $1 Exit"
        exit 1
    fi
}

# Git 소스를 최신화 한다.
# TODO jenkins 사용하면 변경될 수 있음
git pull > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] git pull Execute ${RET}"
validate_exit ${RET}


# Podman Build image
# TODO AWS ECR을 사용하게 되면 변경 예정
podman build -t ${APP_NAME}:${APP_VERSION} -f ${DOCKER_FILE} ./ > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] podman build -t ${APP_NAME}:${APP_VERSION} -f ${DOCKER_FILE} ./ Execute ${RET}"
validate_exit ${RET}

if [ -e "${SERVICE_FILE_PATH}" ]
then
    # systemd 종료
    systemctl --user stop container-${APP_NAME}.service > /dev/null 2>&1 && RET="Success" || RET="Fail"
    echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] systemctl --user daemon-reload Execute ${RET}"
    validate_exit ${RET}

    # systemd disable 처리
    systemctl --user disable container-${APP_NAME}.service > /dev/null 2>&1 && RET="Success" || RET="Fail"
    echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] systemctl --user disable container-${APP_NAME}.service Execute ${RET}"
    validate_exit ${RET}

    # ${SERVICE_FILE_PATH} 삭제 처리
    rm -f ${SERVICE_FILE_PATH} > /dev/null 2>&1 && RET="Success" || RET="Fail"
    echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] rm -f ${SERVICE_FILE_PATH} Execute ${RET}"
    validate_exit ${RET}

    # systemd reload 실행 
    systemctl --user daemon-reload > /dev/null 2>&1 && RET="Success" || RET="Fail"
    echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] systemctl --user daemon-reload Execute ${RET}"
    validate_exit ${RET}

fi

# Podman Container 실행 이미지명 가져옴
image_name=`podman ps -a | grep ${APP_NAME} | awk '{print $2; exit}'`

# Podman Container 삭제
if [ -n "${image_name}" ]
then
    podman container rm -f ${APP_NAME} > /dev/null 2>&1 && RET="Success" || RET="Fail"
    echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] podman container rm -f ${APP_NAME} Execute ${RET}"
    validate_exit ${RET}
    # Podman Image 삭제
    if [ ${DELETE_CONTAINER_IMAGE} ]
    then
        podman image rm -f ${image_name} > /dev/null 2>&1 && RET="Success" || RET="Fail"
        echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] podman image rm -f ${image_name} Execute ${RET}"
        validate_exit ${RET}
    fi 
fi

# Podman Container 생성
podman run -d -p ${APP_PORT}:${APP_CONTAINER_INNER_PORT} --tz=local --log-opt max-size=10m --log-opt max-file=30 --restart=always --name  ${APP_NAME} ${APP_NAME}:${APP_VERSION} > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] podman run -d -p ${APP_PORT}:${APP_CONTAINER_INNER_PORT} --log-opt max-size=10m --log-opt max-file=30 --restart=always --name  ${APP_NAME} ${APP_NAME}:${APP_VERSION} Execute ${RET}"
validate_exit ${RET}

# Podman systemd 
cd ~/.config/systemd/user && podman generate systemd -f -n ${APP_NAME} > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] podman generate systemd -f -n ${APP_NAME} && cd ~/.config/systemd/user Execute ${RET}"
validate_exit ${RET}

# ${USER} 사용자의 systemd 가 유저가 접속하지 않아고 실행되게 설정
loginctl enable-linger ${USER} > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] loginctl enable-linger ${USER} Execute ${RET}"
validate_exit ${RET}

# systemd reload 실행 
systemctl --user daemon-reload > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] systemctl --user daemon-reload Execute ${RET}"
validate_exit ${RET}

# container-${APP_NAME} 서비스 활성화
systemctl --user enable container-${APP_NAME}.service > /dev/null 2>&1 && RET="Success" || RET="Fail"
echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] systemctl --user enable container-${APP_NAME}.service Execute ${RET}"
validate_exit ${RET}

echo "[$(date '+%Y-%m-%d %H:%M:%S.%3N')] == ${APP_NAME} Podman Deploy End =="

exit 0
