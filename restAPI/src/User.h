#pragma once

#include <string>

namespace sp
{
    struct User
    {
        std::string username;
        std::string password_hash;
        std::string email_id;
        bool chief;
    };
}