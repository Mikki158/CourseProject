#include "Error.h"

namespace sp
{
    std::string error_str(const ErrorCode e)
    {
        switch (e)
        {
        case ErrorCode::OK:
            return "OK";

        case ErrorCode::USER_NOT_FOUND:
            return "Пользователь не обнаружен";

        case ErrorCode::INTERNAL_ERROR:
            return "Some internal error occured";

        case ErrorCode::AUTHENTICATION_ERROR:
            return "Неверный пароль";
        
        default:
            return "UNKNOWN ERROR";
        }
    }
}