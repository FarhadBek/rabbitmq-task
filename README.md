# rabbitmq-task

#Для локального развертывания проекта необходимо:
1. Запустить докер и запустить данную команду: docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.9-management
2. Перед запуском сервисов нужно установить необходимые модули, для этого на каждом из сервисов нужно запустить команду: npm i express amqplib
3. Для запуска на каждом из сервисов необходимо запустить команду: node index.js
4. Для тестирования АПИ необходимо открыть приложение Postman и отправить POST запрос на localhost:4001/multiply. Тело запроса должно содержать параметр "num" с числовым значением. (Пример: {"num": 5})
5. Результат должен выглядеть таким образом: Number multiplied by 5 => "отправленное значение умноженное на 5"
