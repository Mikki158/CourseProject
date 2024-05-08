#include "db_utils.h"

#include <iostream>
#include <iomanip>
#include <string>
#include <tuple>
#include <regex>
#include <optional>
#include "crow.h"
#include "crow/middlewares/cors.h"
#include <pqxx/pqxx>
#include <jwt-cpp/jwt.h>
#include <ctime>
#include <boost/date_time/gregorian/gregorian.hpp>
#include <boost/lexical_cast.hpp>

struct RequestLogger
{
    struct context
    {

    };

    void before_handle(crow::request &req, crow::response & /*res*/, context & /*ctx*/)
    {
        CROW_LOG_DEBUG << "Before request handle: " + req.url;
    }

    void after_handle(crow::request &req, crow::response & /*res*/, context & /*ctx*/)
    {
        CROW_LOG_DEBUG << "After request handle: " + req.url; 
    }
};

static std::string btos(bool x)
{
    if(x)
        return "true";
    else
        return "false";
}

static bool get_part_value_string_if_present(const crow::multipart::message& multi_part_message, const char* part_name, std::string& part_value)
{
    auto it = multi_part_message.part_map.find(part_name);
    if (it == multi_part_message.part_map.end() || it->second.body.empty())
    {
        return false;
    }
    part_value = it->second.body;
    return true;
};

static bool get_part_value_bool_if_present(const crow::multipart::message& multi_part_message, const char* part_name, bool& part_value)
{
    auto it = multi_part_message.part_map.find(part_name);
    if (it == multi_part_message.part_map.end() || it->second.body.empty())
    {
        return false;
    }

    if(it->second.body == "true")
        part_value = true;
    else
        part_value = false;

    return true;
};

static bool get_part_value_int_if_present(const crow::multipart::message& multi_part_message, const char* part_name, int& part_value)
{
    auto it = multi_part_message.part_map.find(part_name);
    if (it == multi_part_message.part_map.end() || it->second.body.empty())
    {
        return false;
    }

    part_value = std::stoi(it->second.body);

    return true;
};



static bool verify_authorization_header(const crow::request &req, sp::User *user = new sp::User{})
{
    const auto &headers_it = req.headers.find("Authorization");
    if(headers_it == req.headers.end())
    {
        CROW_LOG_ERROR << "Request headers doesn`t contain Authorization";
        return false;
    }

    CROW_LOG_DEBUG << "Verify 1";

    const std::string &authorization_value = headers_it->second;

    std::regex bearer_scheme_regex("Bearer +([A-Za-z0-9_\\-.~+]+[=]*)");
    std::smatch m;

    if(!std::regex_match(authorization_value, m, bearer_scheme_regex))
    {
        CROW_LOG_ERROR << "Authorization header's value has invalid format";
        return false;
    }

    CROW_LOG_DEBUG << "Verify 2";

    auto decoded_token = jwt::decode(m[1].str());

    //CROW_LOG_DEBUG << decoded_token;

    //Расшифровать JWT в кодировке base64, проверить подпись, проверить срок действия
    auto verifier = jwt::verify()
                        .allow_algorithm(jwt::algorithm::hs512{"secret"})
                        .with_issuer("SP");
    
    try
    {
        verifier.verify(decoded_token);
    }
    catch(const std::exception &e)
    {
        CROW_LOG_ERROR << "Token verification error: " << e.what();
        return false;
    }

    CROW_LOG_DEBUG << "Verify 3" << decoded_token.get_payload_claim("chief").as_string();

    if(decoded_token.get_payload_claim("chief").as_string() == "true")
        user->chief = true;
    else
        user->chief = false;
    //CROW_LOG_DEBUG << decoded_token.get_payload_claim("chief").as_boolean();

    CROW_LOG_DEBUG << "Verify 3.1";

    //user->chief = decoded_token.get_payload_claim("chief").as_boolean();

    CROW_LOG_DEBUG << "Verify 4";

    //username = decoded_token.get_payloda_claim("username").as_string();
    return true;
};

int main()
{
    crow::App<RequestLogger, crow::CORSHandler> app;

    auto &cors = app.get_middleware<crow::CORSHandler>();

    cors
        .global()
            .methods("POST"_method, "GET"_method)
        .prefix("/")
            .origin("http://localhost:5173")
            .allow_credentials();
    

    //pqxx::connection c("dbname=user user=misha password=123");
    //std::cout << "Connected to server with version " << c.server_version() << '\n';

    /*CROW_ROUTE(app, "/")([](){
        CROW_LOG_DEBUG << "Query: ";
        return "Hello world";
    });*/

    CROW_ROUTE(app, "/createaccount")
        .methods(crow::HTTPMethod::POST)([](const crow::request &req)
        {
            sp::User user;

            if(!verify_authorization_header(req, &user))
            {
                return crow::response(crow::status::UNAUTHORIZED, sp::error_str(sp::ErrorCode::AUTHENTICATION_ERROR));
            }
            if(!user.chief)
            {
                return crow::response(crow::status::UNAUTHORIZED, "У вас нет прав на создание пользователей");
            }

            crow::multipart::message multi_part_message(req);
    
            sp::User user_details;
            std::string password;
            // Check if required fields are there
            if (!get_part_value_string_if_present(multi_part_message, "emailid", user_details.email_id))
            {
                return crow::response(crow::status::BAD_REQUEST, "Required part 'emailid' is missing or empty");
            }
            if (!get_part_value_string_if_present(multi_part_message, "username", user_details.username))
            {
                return crow::response(crow::status::BAD_REQUEST, "Required part 'username' is missing or empty");
            }
            if (!get_part_value_string_if_present(multi_part_message, "password", password))
            {
                return crow::response(crow::status::BAD_REQUEST, "Required part 'password' is missing or empty");
            }
            if (!get_part_value_bool_if_present(multi_part_message, "chief", user_details.chief))
            {
                return crow::response(crow::status::BAD_REQUEST, "Required part 'chief' is missing or empty");
            }
            if (!sp::create_new_account(user_details, password))
            {
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(sp::ErrorCode::INTERNAL_ERROR));
            }

            return crow::response(crow::status::OK);
        });

    CROW_ROUTE(app, "/login")
        .methods(crow::HTTPMethod::POST)([](const crow::request &req){
            
            // Загрузка и проверка тела запроса
            const auto &headers_it = req.headers.find("Content-Length");
            if(headers_it == req.headers.end())
            {
                return crow::response(crow::status::BAD_REQUEST, "Content-Length header is missing");
            }
            CROW_LOG_DEBUG << "Query: 1";

            int request_body_length = std::stoi(headers_it->second);

            // "username" и "password" вместе с '{', '}', запятой и кавычками сами по себе содержат 23 символа
            if(request_body_length <= 23)
            {
                return crow::response(crow::status::BAD_REQUEST, "Request body is too short");
            }
            CROW_LOG_DEBUG << "Query: 2";

            crow::json::rvalue request_body_json = crow::json::load(req.body.c_str(), request_body_length);
            if(request_body_json.error())
            {
                return crow::response(crow::status::BAD_REQUEST, "Invalid request body - should be a valid JSON string");
            }
            CROW_LOG_DEBUG << "Query: 3";

            // Проверка на то, пустые поля или нет, если пустые, то вернуть 400
            if(!request_body_json.has("username") || !request_body_json.has("password") 
                || request_body_json["username"].s().size() == 0 || request_body_json["password"].s().size() == 0)
            {
                return crow::response(crow::status::BAD_REQUEST, "Invalid request body - missing username and/or password");
            }
            CROW_LOG_DEBUG << "Query: 4";

            const std::string username = request_body_json["username"].s();
            const std::string password = request_body_json["password"].s();

            // Проверка на то, есть ли в базе данных имя username, если нет, вернуть 401, в противном случае извлечь данные пользователя
            auto result = sp::get_user_details(username);
            if(std::holds_alternative<sp::ErrorCode>(result))
            {
                return crow::response(crow::status::UNAUTHORIZED, sp::error_str(std::get<sp::ErrorCode>(result)));
            } 
            CROW_LOG_DEBUG << "Query: 5";

            const auto &user = std::get<sp::User>(result);

            CROW_LOG_DEBUG << "Query: 5.1" << user.username << user.password_hash << user.email_id << user.chief;

            // Вычислить хэш введенного пароля
            // Проверить, совпадает ли значение хэша с значением в базе данных, если нет, вернуть 401
            if(!sp::is_password_valid(password, user.password_hash))
            {
                return crow::response(crow::status::UNAUTHORIZED, sp::error_str(sp::ErrorCode::AUTHENTICATION_ERROR));
            }
            CROW_LOG_DEBUG << "Query: 6";

            // Обновите статус входа в систему, создайте подписанный токен JWT, верните его в ответ
            auto current_time = std::chrono::system_clock::now();
            auto token = jwt::create()
                        .set_issuer("SP")
                        .set_type("JWS")
                        .set_issued_at(current_time)
                        .set_expires_at(current_time + std::chrono::seconds{3600}) // TODO: ить на соответствующие сроки годности
                        .set_payload_claim("username", jwt::claim(user.username))
                        .set_payload_claim("chief", jwt::claim(btos(user.chief)))
                        .sign(jwt::algorithm::hs512{"secret"});

            CROW_LOG_DEBUG << "Query: 7";
            //CROW_LOG_DEBUG << btos(user.chief);

            crow::json::wvalue resp{ {"access_token", token}, {"username", user.username}, {"chief", btos(user.chief)} };
            return crow::response(crow::status::OK, resp);

        });

        CROW_ROUTE(app, "/addshedule")
            .methods(crow::HTTPMethod::POST)([](const crow::request &req){
            
            sp::Shedule shedule;
            if(!verify_authorization_header(req))
            {
                return crow::response(crow::status::UNAUTHORIZED, sp::error_str(sp::ErrorCode::AUTHENTICATION_ERROR));
            }

            crow::multipart::message multi_part_message(req);

            if(!get_part_value_string_if_present(multi_part_message, "subjectname", shedule.subjectname))
            {
                return crow::response(crow::status::BAD_REQUEST, "Название предмета отсутствует");
            }
            if(!get_part_value_string_if_present(multi_part_message, "formatsubject", shedule.formatsubject))
            {
                return crow::response(crow::status::BAD_REQUEST, "Тип предмета отсутствует");
            }
            if(!get_part_value_string_if_present(multi_part_message, "teacher", shedule.teacher))
            {
                return crow::response(crow::status::BAD_REQUEST, "Преподаватель предмета отсутствует");
            }
            if(!get_part_value_string_if_present(multi_part_message, "groupname", shedule.groupname))
            {
                return crow::response(crow::status::BAD_REQUEST, "Номер группы отсутствует");
            }
            if(!get_part_value_int_if_present(multi_part_message, "numberpair", shedule.numberpair))
            {
                return crow::response(crow::status::BAD_REQUEST, "Номер пары отсутствует");
            }
            if(!get_part_value_string_if_present(multi_part_message, "date_subject", shedule.date_subject))
            {
                return crow::response(crow::status::BAD_REQUEST, "Дата пары отсутствует");
            }

            auto result = sp::couple_available(shedule);

            if(std::holds_alternative<sp::Shedule>(result))
            {
                const auto &oldshedule = std::get<sp::Shedule>(result);
                std::stringstream s;
                s << oldshedule.date_subject << " " << oldshedule.numberpair << " парой у группы " << 
                    oldshedule.groupname << " стоит предмет " << oldshedule.subjectname << ", " << oldshedule.formatsubject;

                return crow::response(crow::status::BAD_REQUEST, s.str());
            }

            if(!sp::add_shedule(shedule))
            {
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(sp::ErrorCode::INTERNAL_ERROR));
            }

            return crow::response(crow::status::OK);
        });

        CROW_ROUTE(app, "/getallshedule")
            .methods(crow::HTTPMethod::GET)([](const crow::request &req){
            
            const crow::query_string &qs = req.url_params;

            std::string date_start = qs.get("date_start");
            std::string groupname = qs.get("groupname");

            boost::gregorian::date start(std::stoi(date_start.substr(0, 4)), std::stoi(date_start.substr(5, 2)), std::stoi(date_start.substr(8, 2)));
            int pair;
            std::vector<crow::json::wvalue> result;
            std::vector<crow::json::wvalue> temp;
            std::vector<std::string> days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};

            for(int i = 0; i < 6; i++)
            {
                pair = 1;

                std::string current_day = boost::lexical_cast<std::string>(start);

                std::string months = current_day.substr(5, 3);

                if(months == "Jan")
                    current_day.replace(5, 4, "01-");
                else if(months == "Feb")
                    current_day.replace(5, 4, "02-");
                else if(months == "Mar")
                    current_day.replace(5, 4, "03-");
                else if(months == "Apr")
                    current_day.replace(5, 4, "04-");
                else if(months == "May")
                    current_day.replace(5, 4, "05-");
                else if(months == "Jun")
                    current_day.replace(5, 4, "06-");
                else if(months == "Jul")
                    current_day.replace(5, 4, "07-");
                else if(months == "Aug")
                    current_day.replace(5, 4, "08-");
                else if(months == "Sep")
                    current_day.replace(5, 4, "09-");
                else if(months == "Oct")
                    current_day.replace(5, 4, "10-");
                else if(months == "Nov")
                    current_day.replace(5, 4, "11-");
                else if(months == "Dec")
                    current_day.replace(5, 4, "12-");

                auto list = sp::get_shedule_list(current_day, groupname);

                if(std::holds_alternative<sp::ErrorCode>(list))
                {
                    sp::ErrorCode ec = std::get<sp::ErrorCode>(list);
                    return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(ec));
                }

                const auto &day = std::get<std::vector<sp::Shedule>>(list);

                for(int j = 0; j < 6; j++)
                {
                    sp::Shedule shedule;

                    if(j < day.size())
                        shedule = day[j];
                    else
                        shedule = {.numberpair = 8};

                    while(shedule.numberpair != pair)
                    {
                        if(pair >= 8)
                            pair = 7;
                        crow::json::wvalue window{
                            {"id", ""},
                            {"subjectname", "***"},
                            {"formatsubject", ""},
                            {"teacher", ""},
                            {"groupname", ""},
                            {"numberpair", pair},
                            {"date_subject", ""},
                            {"auditorium", ""}
                        };

                        temp.push_back(window);
                        pair++;

                        if(j >= day.size())
                            j++;

                        if(pair >= 8)
                            break;
                    }

                    if(j < day.size())
                    {
                        crow::json::wvalue entry{
                            {"id", shedule.id},
                            {"subjectname", shedule.subjectname},
                            {"formatsubject", shedule.formatsubject},
                            {"teacher", shedule.teacher},
                            {"groupname", shedule.groupname},
                            {"numberpair", shedule.numberpair},
                            {"date_subject", shedule.date_subject},
                            {"auditorium", shedule.auditorium}
                        };
                        temp.push_back(entry);
                    }

                    pair++;
                }

                crow::json::wvalue dayjson{{days[i], temp}};
                result.push_back(dayjson);
                temp.clear();
                start += boost::gregorian::days(1);
            }

            return crow::response(crow::status::OK, crow::json::wvalue({result}));

        });


        CROW_ROUTE(app, "/getallsubjectname")
            .methods(crow::HTTPMethod::GET)([](const crow::request &req){

            //auto result = sp::get_query_list(sp::SelectQuery::subjects, subject);
            auto result = sp::get_subject_list();

            if(std::holds_alternative<sp::ErrorCode>(result))
            {
                sp::ErrorCode ec = std::get<sp::ErrorCode>(result);
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(ec));
            }

            const auto &subjects = std::get<std::vector<sp::Subject>>(result);
            std::vector<crow::json::wvalue> temp;

            for(const auto &subject: subjects)
            {
                crow::json::wvalue entry{
                    {"subjectname", subject.subjectname}
                };

                temp.push_back(entry);
            }

            return crow::response(crow::status::OK, crow::json::wvalue(temp));
        });


        CROW_ROUTE(app, "/getallformat")
            .methods(crow::HTTPMethod::GET)([](const crow::request &req){

            auto result = sp::get_format_list();

            if(std::holds_alternative<sp::ErrorCode>(result))
            {
                sp::ErrorCode ec = std::get<sp::ErrorCode>(result);
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(ec));
            }

            const auto &formats = std::get<std::vector<sp::Format>>(result);
            std::vector<crow::json::wvalue> temp;

            for(const auto &format: formats)
            {
                crow::json::wvalue entry{
                    {"formatsubject", format.formatsubject}
                };

                temp.push_back(entry);
            }

            return crow::response(crow::status::OK, crow::json::wvalue(temp));
        });


        CROW_ROUTE(app, "/getallteacher")
            .methods(crow::HTTPMethod::GET)([](const crow::request &req){

            auto result = sp::get_teacher_list();

            if(std::holds_alternative<sp::ErrorCode>(result))
            {
                sp::ErrorCode ec = std::get<sp::ErrorCode>(result);
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(ec));
            }

            const auto &teachers = std::get<std::vector<sp::Teacher>>(result);
            std::vector<crow::json::wvalue> temp;

            for(const auto &teacher: teachers)
            {
                crow::json::wvalue entry{
                    {"teacherfio", teacher.teacherfio},
                    {"academic_degree", teacher.academic_degree},
                    {"category", teacher.category},
                    {"post", teacher.post},
                };

                temp.push_back(entry);
            }

            return crow::response(crow::status::OK, crow::json::wvalue(temp));
        });


        CROW_ROUTE(app, "/getallgroup")
            .methods(crow::HTTPMethod::GET)([](const crow::request &req){

            auto result = sp::get_group_list();

            if(std::holds_alternative<sp::ErrorCode>(result))
            {
                sp::ErrorCode ec = std::get<sp::ErrorCode>(result);
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(ec));
            }

            const auto &groups = std::get<std::vector<sp::Group>>(result);
            std::vector<crow::json::wvalue> temp;

            for(const auto &group: groups)
            {
                crow::json::wvalue entry{
                    {"groupname", group.groupname},
                    {"direction", group.direction},
                    {"peoplecount", group.peoplecount}
                };

                temp.push_back(entry);
            }

            return crow::response(crow::status::OK, crow::json::wvalue(temp));
        });

        CROW_ROUTE(app, "/adddata")
            .methods(crow::HTTPMethod::POST)([](const crow::request &req){
            
            sp::User user;

            CROW_LOG_DEBUG << "ADD 1";

            if(!verify_authorization_header(req, &user))
            {
                return crow::response(crow::status::UNAUTHORIZED, sp::error_str(sp::ErrorCode::AUTHENTICATION_ERROR));
            }
            if(!user.chief)
            {
                return crow::response(crow::status::UNAUTHORIZED, "У вас нет прав на добавление этих данных");
            }

            CROW_LOG_DEBUG << "ADD 2";

            crow::multipart::message multi_part_message(req);

            auto data = multi_part_message.part_map.find("data");

            CROW_LOG_DEBUG << data->second.body;

            if(data->second.body == "subject")
            {
                sp::Subject subject;

                if(!get_part_value_string_if_present(multi_part_message, "subjectname", subject.subjectname))
                {
                    return crow::response(crow::status::BAD_REQUEST, "Название предмета отсутствует");
                }
                if(!get_part_value_string_if_present(multi_part_message, "auditorium", subject.auditorium))
                {
                    return crow::response(crow::status::BAD_REQUEST, "Номер аудитории отсутствует");
                }

                CROW_LOG_DEBUG << "ADD 3";

                auto result = sp::availability_subject(subject);

                if(std::holds_alternative<sp::Subject>(result))
                {
                    const auto &oldsubject = std::get<sp::Subject>(result);
                    std::stringstream s;

                    s << "Предмет " << oldsubject.subjectname << " проводимый в аудитории " << oldsubject.auditorium << " уже есть в базе";

                    return crow::response(crow::status::BAD_REQUEST, s.str());
                }

                CROW_LOG_DEBUG << "ADD 4";

                if(!sp::add_subject(subject))
                {
                    return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(sp::ErrorCode::INTERNAL_ERROR));
                }

                CROW_LOG_DEBUG << "ADD 5";

                return crow::response(crow::status::OK);
            }
            else if(data->second.body == "teacher")
            {
                CROW_LOG_DEBUG << "ADD teacher 5";

                sp::Teacher teacher;

                if(!get_part_value_string_if_present(multi_part_message, "teacherfio", teacher.teacherfio))
                {
                    return crow::response(crow::status::BAD_REQUEST, "ФИО преподавателя отсутствует");
                }
                if(!get_part_value_string_if_present(multi_part_message, "academic_degree", teacher.academic_degree))
                {
                    teacher.academic_degree = '-';
                }
                if(!get_part_value_string_if_present(multi_part_message, "category", teacher.category))
                {
                    teacher.category = '-';
                }
                if(!get_part_value_string_if_present(multi_part_message, "post", teacher.post))
                {
                    return crow::response(crow::status::BAD_REQUEST, "Должность преподавателя отсутствует");
                }

                auto result = sp::availability_teacher(teacher);

                if(result)
                {
                    const auto &oldteacher = *result;

                    std::stringstream s;

                    s << "Преподаватель " << oldteacher.teacherfio << " уже есть в базе";

                    return crow::response(crow::status::BAD_REQUEST, s.str());
                }

                if(!sp::add_teacher(teacher))
                {
                    return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(sp::ErrorCode::INTERNAL_ERROR));
                }
                
                return crow::response(crow::status::OK);
            }
            else if(data->second.body == "group")
            {
                sp::Group group;

                if(!get_part_value_string_if_present(multi_part_message, "groupname", group.groupname))
                {
                    return crow::response(crow::status::BAD_REQUEST, "Номер группы отсутствует");
                }
                if(!get_part_value_string_if_present(multi_part_message, "direction", group.direction))
                {
                    return crow::response(crow::status::BAD_REQUEST, "Направление группы отсутствует");
                }
                if(!get_part_value_int_if_present(multi_part_message, "peoplecount", group.peoplecount))
                {
                    return crow::response(crow::status::BAD_REQUEST, "Количество людей в группе отсутствует");
                }

                auto result = sp::availability_group(group);

                if(result)
                {
                    const auto &oldgroup = *result;

                    std::stringstream s;

                    s << "Группа " << oldgroup.groupname << " напрваления " << oldgroup.direction << " уже есть в базе"; 
                
                    return crow::response(crow::status::BAD_REQUEST, s.str());
                }

                if(!sp::add_group(group))
                {
                    return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(sp::ErrorCode::INTERNAL_ERROR));
                }

                return crow::response(crow::status::OK);
            }
    });

    CROW_ROUTE(app, "/deleteshedule")
        .methods(crow::HTTPMethod::POST)([](const crow::request &req)
        {
            crow::multipart::message multi_part_message(req);

            sp::Shedule shedule;

            CROW_LOG_DEBUG << "DELETE 1";

            if(!get_part_value_string_if_present(multi_part_message, "date_subject", shedule.date_subject))
            {
                return crow::response(crow::status::BAD_REQUEST, "Дата пары отсутствует");
            }

            CROW_LOG_DEBUG << "DELETE 2";

            if(!get_part_value_int_if_present(multi_part_message, "numberpair", shedule.numberpair))
            {
                return crow::response(crow::status::BAD_REQUEST, "Номер пары отсутствует");
            }

            CROW_LOG_DEBUG << "DELETE 3";

            if(!get_part_value_string_if_present(multi_part_message, "groupname", shedule.groupname))
            {
                return crow::response(crow::status::BAD_REQUEST, "Номер группы отсутствует");
            }

            CROW_LOG_DEBUG << "DELETE 4";

            auto result = sp::couple_available(shedule);

            CROW_LOG_DEBUG << "DELETE 5";

            if(!std::holds_alternative<sp::Shedule>(result))
            {
                return crow::response(crow::status::BAD_REQUEST, "Такой пары нет");
            }

            if(!sp::delete_shedule(shedule))
            {
                return crow::response(crow::status::INTERNAL_SERVER_ERROR, sp::error_str(sp::ErrorCode::INTERNAL_ERROR));
            }

            CROW_LOG_DEBUG << "DELETE 6";

            return crow::response(crow::status::OK);
    });



    app.loglevel(crow::LogLevel::Debug);

    app.bindaddr("127.0.0.1").port(8080).run();
}