#pragma once

#include "Formats.h"
#include "Group.h"
#include "Subject.h"
#include "Teacher.h"

namespace sp
{
    struct Shedule
    {
        int id;
        std::string subjectname;
        std::string formatsubject;
        std::string teacher;
        std::string groupname;
        int numberpair;
        std::string date_subject;
        std::string auditorium;
    };
    
}
