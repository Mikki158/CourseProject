#include "db_utils.h"

#include <crow/logging.h>
#include <pqxx/pqxx>
#include <cstddef>

namespace sp
{
    bool stob(std::string x)
    {
        if(x == "true")
            return true;
        else
            return false;
    }

    std::variant<User, ErrorCode> get_user_details(const std::string &username)
    {
        pqxx::connection c("dbname=user user=misha password=123");

        CROW_LOG_DEBUG << "Details: 1";

        pqxx::read_transaction transaction(c);

        try
        {
            CROW_LOG_DEBUG << "Details: 2.1";
            auto row = transaction.exec1("SELECT * FROM users WHERE username=" + transaction.quote(username));
            CROW_LOG_DEBUG << "Details: 2.2";
            transaction.commit();
            CROW_LOG_DEBUG << "Details: 2.3";
            return User{
                .username = row["username"].c_str(),
                .password_hash = row["password_hash"].c_str(),
                .email_id = row["emailid"].c_str(),
                .chief = stob(row["chief"].c_str())
            };

            CROW_LOG_DEBUG << "Details: 2";
        }
        catch (const pqxx::unexpected_rows &e)
        {
            CROW_LOG_DEBUG << "Details: 3";
            CROW_LOG_ERROR << "Number of rows returned is not equal to 1: " << e.what();
            return ErrorCode::INTERNAL_ERROR;
        }
    }

    bool is_password_valid(const std::string &input_password, const std::string &stored_password_hash)
    {
        pqxx::connection c("dbname=user user=misha password=123");

        pqxx::read_transaction transaction(c);

        try
        {
            std::stringstream s;
            s << "SELECT (CASE WHEN crypt(" << transaction.quote(input_password) << ',' << transaction.quote(stored_password_hash) << ") = "
            << transaction.quote(stored_password_hash) << " THEN true ELSE false END) as is_equal";
            const std::string query = s.str();
            CROW_LOG_DEBUG << "Query: " << query;
            bool is_password_match = transaction.query_value<bool>(query);
            transaction.commit();
            return is_password_match;
        }
        catch(const pqxx::unexpected_rows &e)
        {
            CROW_LOG_ERROR << "Number of rows returned is not equal to 1: " << e.what();
            return false;
        }
        catch(const pqxx::usage_error &e)
        {
            CROW_LOG_ERROR << "Number of columns returned is not equal to 1: " << e.what();
            return false;
        }
        catch(const pqxx::sql_error &e)
        {
            CROW_LOG_ERROR << "Internal exception was thrown: " << e.what();
            return false;
        }
        
    }

    bool create_new_account(const User &user_details, const std::string &password)
    {
        pqxx::connection c("dbname=user user=misha password=123");

        pqxx::work transaction(c);

        try
        {
            std::stringstream s;
            s << "INSERT INTO users(username, emailid, password_hash, chief) "
                "VALUES("
                << transaction.quote(user_details.username) << ','
                << transaction.quote(user_details.email_id) << ", crypt("
                << transaction.quote(password) << ", gen_salt('bf', 8)),"
                << transaction.quote(user_details.chief) << ')';
            
            const std::string query = s.str();
            CROW_LOG_DEBUG << "Query: " << query;
            auto result = transaction.exec(query);

            if(result.affected_rows() != 1)
            {
                CROW_LOG_ERROR << "Something went wrong - couldn't insert data into database table";
                return false;
            }
            transaction.commit();
            return true;
        }
        catch(const pqxx::sql_error &e)
        {
            CROW_LOG_ERROR << "Internal exception was thrown: " << e.what();
            return false;
        }
        
    }

    std::variant<Shedule, bool> couple_available(const Shedule &shedule)
    {
        pqxx::connection c("dbname=user user=misha password=123");

        pqxx::read_transaction transaction(c);
        
        try
        {
            auto row = transaction.exec1("SELECT * FROM public.shedule WHERE numberpair = " + transaction.quote(shedule.numberpair) + " AND date_subject = " 
            + transaction.quote(shedule.date_subject) + 
            " AND groupname = " + transaction.quote(shedule.groupname));
            transaction.commit();
            
            return Shedule{
                .subjectname = row["subjectname"].c_str(),
                .formatsubject = row["formatsubject"].c_str(),
                .teacher = row["teacher"].c_str(),
                .groupname = row["groupname"].c_str(),
                .numberpair = std::stoi(row["numberpair"].c_str()),
                .date_subject = row["date_subject"].c_str(),
                .auditorium = row["auditorium"].c_str()
            };
        }
        catch(const pqxx::unexpected_rows &e)
        {
            return true;
        }
    }

    bool add_shedule(const Shedule &shedule)
    {
        pqxx::connection c("dbname=user user=misha password=123");

        pqxx::work transaction(c);

        try
        {
            std::stringstream s;

            s << "INSERT INTO shedule (subjectname, formatsubject, teacher, groupname, numberpair, date_subject, auditorium) "
                "VALUES ("
                << transaction.quote(shedule.subjectname) << ','
                << transaction.quote(shedule.formatsubject) << ','
                << transaction.quote(shedule.teacher) << ','
                << transaction.quote(shedule.groupname) << ','
                << transaction.quote(shedule.numberpair) << ','
                << transaction.quote(shedule.date_subject) << ','
                << transaction.quote(shedule.auditorium) << ')';

            auto result = transaction.exec(s.str());
            if(result.affected_rows() != 1)
            {
                CROW_LOG_ERROR << "Something went wrong - couldn`t insert data into database table";
                return false;
            }

            transaction.commit();
            return true;
        }
        catch(const pqxx::sql_error &e)
        {
            CROW_LOG_ERROR << "Internal exception was thrown: " << e.what();
            return false;
        }
        
    }

    std::variant<std::vector<Shedule>, ErrorCode> get_shedule_list(std::string &date, std::string &groupname)
    {
        pqxx::connection c("dbname=user user=misha password=123");

        pqxx::read_transaction transaction(c);

        try
        {
            std::stringstream s;
            s << "SELECT * FROM shedule WHERE date_subject = " << transaction.quote(date) << " AND groupname = " 
            << transaction.quote(groupname) << " ORDER BY date_subject asc, numberpair asc;";

            std::string query = s.str();
            CROW_LOG_DEBUG << "Query: " << query;

            auto result = transaction.exec(query);
            transaction.commit();

            std::vector<Shedule> day;

            for(size_t i = 0; i < result.size(); i++)
            {
                auto row = result[i];

                Shedule shedule {
                    .id = std::stoi(row["id"].c_str()),
                    .subjectname = row["subjectname"].c_str(),
                    .formatsubject = row["formatsubject"].c_str(),
                    .teacher = row["teacher"].c_str(),
                    .groupname = row["groupname"].c_str(),
                    .numberpair = std::stoi(row["numberpair"].c_str()),
                    .date_subject = row["date_subject"].c_str(),
                    .auditorium = row["auditorium"].c_str()
                };

                day.push_back(shedule);                
            }

            return day;
        }
        catch(const pqxx::sql_error &e)
        {
            CROW_LOG_ERROR << "Internal exception was throw: " << e.what();
            return ErrorCode::INTERNAL_ERROR;
        }
        
    }
}