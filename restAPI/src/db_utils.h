#pragma once

#include "User.h"
#include "Shedule.h"
#include "Error.h"

#include <variant>
#include <optional>
#include <vector>
#include <iostream>

namespace sp
{
    static bool stob(std::string x);

    std::variant<User, ErrorCode> get_user_details(const std::string &username);

    bool is_password_valid(const std::string &input_password, const std::string &stored_password_hash);

    bool create_new_account(const User &user_details, const std::string &password);

    std::variant<Shedule, bool> couple_available(const Shedule &shedule);

    bool add_shedule(const Shedule &shedule);

    std::variant<std::vector<Shedule>, ErrorCode> get_shedule_list(std::string &date, std::string &groupname);

    std::variant<std::vector<Subject>, ErrorCode> get_subject_list();

    std::variant<std::vector<Format>, ErrorCode> get_format_list();

    std::variant<std::vector<Teacher>, ErrorCode> get_teacher_list();

    std::variant<std::vector<Group>, ErrorCode> get_group_list();

    std::variant<Subject, bool> availability_subject(const Subject &subject);

    bool add_subject(const Subject &subject);

    std::optional<Teacher> availability_teacher(const Teacher &teacher);

    bool add_teacher(const Teacher &teacher);

    std::optional<Group> availability_group(const Group &group);

    bool add_group(const Group &group);

    bool delete_shedule(const Shedule &shedule);
}
