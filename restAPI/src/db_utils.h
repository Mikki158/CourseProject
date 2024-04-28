#pragma once

#include "User.h"
#include "Shedule.h"
#include "Error.h"

#include <variant>
#include <optional>
#include <vector>

namespace sp
{
    static bool stob(std::string x);

    std::variant<User, ErrorCode> get_user_details(const std::string &username);

    bool is_password_valid(const std::string &input_password, const std::string &stored_password_hash);

    bool create_new_account(const User &user_details, const std::string &password);

    std::variant<Shedule, bool> couple_available(const Shedule &shedule);

    bool add_shedule(const Shedule &shedule);

    std::variant<std::vector<Shedule>, ErrorCode> get_shedule_list(std::string &date, std::string &groupname);
}
