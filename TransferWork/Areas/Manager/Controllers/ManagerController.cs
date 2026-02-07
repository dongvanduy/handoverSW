using HandOver.Common;
using Microsoft.Ajax.Utilities;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace HandOver.Areas.Manager.Controllers
{
    public class ManagerController : Controller
    {
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        private static List<User> ListUsers = new List<User>();
        private static List<Model> ListModel = new List<Model>();
        // GET: Manager/Manager
        // Action
        public async Task<ActionResult> Dashboard()
        {
            ListUsers = await Task.Run(() => db.Users.ToList());
            ListModel = await Task.Run(() => db.Models1.ToList());
            ViewBag.ThisUser = await Task.Run(() => db.Users.SingleOrDefault(u => u.CardID == MySession.USER_SESSION));
            ViewBag.ThisUser.Password = "";
            ViewBag.Role = MySession.USER_ROLE;
            return View();
        }
        private static bool flagGetListUser = false;
        private static object ListUser = null;
        public async Task<ActionResult> GetDataDashboard(string id, int month)
        {
            List<Work> ListWork = db.Works.ToList();
            List<Work> newListWork = null;
            try
            {
                
                if (month == 0)
                {
                    switch (id)
                    {
                        case "All":
                            {
                                newListWork = await Task.Run(() => ListWork.ToList());                                
                                break;
                            }
                        case "PE":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.Flow == "PE-PE").ToList());
                                break;
                            }
                        case "RE":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.Flow == "RE-RE").ToList());
                                break;
                            }
                        case "PE-RE":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.Flow == "PE-RE" || w.Flow == "RE-PE").ToList());
                               break;
                            }
                        default:
                            {
                                newListWork = await Task.Run(() =>
                                        ListWork.Where(work => work.OwnerReceive.Split(',').Any(idTemp => idTemp.Trim() == id)).ToList()
                                    );
                                break;
                            }
                    }
                }
                else
                {
                    switch (id)
                    {
                        case "All":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.DateStart.Month == month).ToList());
                                break;
                            }
                        case "PE":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.Flow == "PE-PE" && w.DateStart.Month == month).ToList());
                                break;
                            }
                        case "RE":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.Flow == "RE-RE" && w.DateStart.Month == month).ToList());
                                break;
                            }
                        case "PE-RE":
                            {
                                newListWork = await Task.Run(() => ListWork.Where(w => w.Flow == "PE-RE" || w.Flow == "RE-PE" && w.DateStart.Month == month).ToList());
                                break;
                            }
                        default:
                            {
                                newListWork = await Task.Run(() =>
                                        ListWork.Where(work => work.OwnerReceive.Split(',').Any(idTemp => idTemp.Trim() == id) && work.DateStart.Month == month).ToList()
                                    );
                                break;
                            }
                    }
                }

                newListWork = await Task.Run(() => GetInfoOwner(newListWork, ListUsers));
                if (!flagGetListUser)
                {
                    ListUser = await Task.Run(() => GetUserList(ListUsers, ""));
                    flagGetListUser = true;
                    
                }
                return Json(new { success = true, ListWorks = newListWork, ListUser = ListUser, ListModel = ListModel }, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return Json(new { error = true, message = "Wrong filter. Please double check or contact us!" }, JsonRequestBehavior.AllowGet);
            }
            
        }

        // Function
        private List<Work> GetInfoOwner(List<Work> ListWorks, List<User> ListUsers)
        {
            for (int i = 0; i < ListWorks.Count; i++)
            {
                ListWorks[i].OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == ListWorks[i].OwnerRequest)
                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));

                List<string> ownerRcIDList = ListWorks[i].OwnerReceive.Split(',').ToList();
                List<object> userList = ownerRcIDList.Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                    .ToList<object>();
                ListWorks[i].OwnerReceive = JsonConvert.SerializeObject(userList);
            }
            return ListWorks;
        }
        private object GetUserList(List<User> ListUsers, string DEPARTMENT)
        {
            object infoUser = null;
            if (DEPARTMENT == "")
            {
                infoUser = ListUsers.Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
            }
            else
            {
                infoUser = ListUsers.Where(u => u.Department == DEPARTMENT)
                    .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
            }           
            return infoUser;
        }

        // Event
        public JsonResult DeleteWork(int id)
        {
            var record = db.Works.FirstOrDefault(r => r.ID == id);

            try
            {
                db.Works.Remove(record);
                db.SaveChanges();
                return Json(new { success = true });
            }
            catch
            {
                return Json(new { error = "Delete work failed. Please double check or contact the administrator!" });
            }
        }
        public JsonResult GetWork(int id)
        {
            if (id == 0)
                return Json(new { error = "ID record is null. Please double check or contact to administrator!" }, JsonRequestBehavior.AllowGet);

            Work record = db.Works.SingleOrDefault(r => r.ID == id);
            if (record == null)
                Json(new { error = "Get work failed. Please double check or contact the administrator!" });

            ListUsers = db.Users.ToList();
            var userReq = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == record.OwnerRequest)
                       .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));

            List<string> ownerRcIDList = record.OwnerReceive.Split(',').ToList();
            List<object> userList = ownerRcIDList
                .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                .ToList<object>();
            var userRec = JsonConvert.SerializeObject(userList);

            return Json(new { success = "success", data = record, userReq = userReq, userRec = userRec }, JsonRequestBehavior.AllowGet);
        }
        public JsonResult EditWork(Work work, string changeTime, string userChange)
        {
            var record = db.Works.FirstOrDefault(r => r.ID == work.ID);

            string valiStatus = ValidationWork(work);
            if (valiStatus != "success")
            {
                return Json(new { error = ValidationWork(work) });
            }
            string depReq;
            string depRec;
            try
            {
                depReq = db.Users.SingleOrDefault(u => u.CardID == work.OwnerRequest).Department;
                depRec = db.Users.SingleOrDefault(u => u.CardID == work.OwnerReceive).Department;
            }
            catch
            {
                return Json(new { status = "CARD ID FAIL" });
            }
            work.Flow = depReq + "-" + depRec;


            Work _old = db.Works.SingleOrDefault(w => w.ID == work.ID);
            work.HistoryLog = CreateChangeLog(userChange, changeTime, _old, work);


            #region Save to database
            try
            {
                db.Works.AddOrUpdate(w => w.ID, work);
                AddOrUpdateModel(work.Model);
                db.SaveChanges();

                ListUsers = db.Users.ToList();
                work.OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == work.OwnerRequest)
                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));
                List<string> ownerRcIDList = work.OwnerReceive.Split(',').ToList();
                List<object> userList = ownerRcIDList
                    .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                    .ToList<object>();
                work.OwnerReceive = JsonConvert.SerializeObject(userList);
                return Json(new { success = true, dataRow = work });
            }
            catch (Exception ex)
            {
                return Json(new { error = "Edit work failed. Please double check or contact the administrator!" });
            }
            #endregion
        }
        private string ValidationWork(Work work)
        {
            if (work.OwnerRequest == null || work.OwnerReceive == null)
                return "Owner request or Owner receive is null. Please double check!";
            if (work.OwnerReceive == work.OwnerRequest)
                return "Owner request and Owner Receive have the same Card ID. Please double check!";

            if (work.DateStart < new DateTime(2000, 01, 01))
                return "Date Start less than 2000-01-01";
            if (work.DueDate < work.DateStart)
                return "Due Date less than Start Date";

            if (work.Type == null)
                return "Type of record is null. Please double check!";
            if (work.Status == null)
                return "Status of record is null ";
            return "success";
        }
        private void AddOrUpdateModel(string modelName)
        {
            if (modelName != null)
            {
                Model md = db.Models1.FirstOrDefault(e => e.Model_ == modelName);
                if (md == null)
                {
                    md = new Model();
                    md.Model_ = modelName;
                    db.Models1.Add(md);
                }
            }
        }
        private string CreateChangeLog(string userChange, string changeTime, Work oldWork, Work newWork)
        {
            var propertiesToCheck = new[]
            {
                new {Name = "Status", Action = "Status"},
                new {Name = "Type", Action = "Type"},
                new {Name = "DateStart", Action = "Date"},
                new {Name = "DueDate", Action = "Due Date"},
                new {Name = "CTF", Action = "CTF"},
                new {Name = "Model", Action = "Model"},
                new {Name = "OwnerRequest", Action = "Owner Request"},
                new {Name = "OwnerReceive", Action = "Owner Receive"},
                new {Name = "WorkDes", Action = "Works"},
                new {Name = "Detail", Action = "Result"}
             };

            var logEntries = new List<JObject>();
            foreach (var prop in propertiesToCheck)
            {
                var oldValue = oldWork.GetType().GetProperty(prop.Name).GetValue(oldWork, null)?.ToString();
                var newValue = newWork.GetType().GetProperty(prop.Name).GetValue(newWork, null)?.ToString();
                if (oldValue != newValue)
                {
                    logEntries.Add(new JObject(
                        new JProperty("User", userChange),
                        new JProperty("Action", prop.Action),
                        new JProperty("Old", oldValue),
                        new JProperty("New", newValue)
                    ));
                }
            }

            var logObject = new JObject();
            if (oldWork.HistoryLog != null)
            {
                logObject = JObject.Parse(oldWork.HistoryLog);
            }

            JArray logEntriesArray;
            if (logObject.ContainsKey(changeTime))
            {
                logEntriesArray = (JArray)logObject[changeTime];
            }
            else
            {
                logEntriesArray = new JArray();
                logObject.Add(changeTime, logEntriesArray);
            }

            logEntriesArray.Add(logEntries);

            return logObject.ToString();
        }
    }  
}