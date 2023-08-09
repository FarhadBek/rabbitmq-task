const { createLogger, format, transports } = require("winston");

const logger = createLogger({
    transports: [
        new transports.File({
            level: 'info',
            filename: 'logsInfos.log'
        }),
        new transports.File({
            level: 'error',
            filename: 'logsErrors.log'
        }) 
    ],
    format:  format.combine(
        format.timestamp(),
        format.json(),
        
        // format.metadata()
        format.prettyPrint()
    )
})

module.exports = logger