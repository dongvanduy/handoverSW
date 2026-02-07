using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web.Mvc;
using System.Web.UI.WebControls;
using HandOver.Common;
using OfficeOpenXml;
using System.IO;
using OfficeOpenXml.Style;
using System.Drawing;
using Image = System.Drawing.Image;
using OfficeOpenXml.Drawing;
using System.Windows.Media.Media3D;
using System.Web.Security;

namespace HandOver.Areas.HandoverRE.Controllers
{
    public class WorksController : BaseController
    {
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        List<Work> ListWorks = new List<Work>();
        List<User> ListUsers = new List<User>();
        private readonly string DEPARTMENT = "RE";
        // GET: OwnerRE/Works
        public ActionResult Index()
        {
            ViewBag.Role = MySession.USER_ROLE;
            return View();
        }
        // Action
        public JsonResult GetListWork()
        {
            try
            {
                ListWorks = db.Works.OrderBy(s => s.ID).Where(w => w.Flow == DEPARTMENT + "-" + DEPARTMENT).ToList();
                ListUsers = db.Users.ToList();

                var infoUser = ListUsers.Where(u => u.CardID != MySession.USER_SESSION && u.Department == DEPARTMENT)
                                        .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
                for (int i = 0; i < ListWorks.Count; i++)
                {
                    ListWorks[i].OwnerRequest = JsonConvert.SerializeObject(ListUsers.Where(u => u.CardID == ListWorks[i].OwnerRequest)
                            .Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName }));

                    List<string> ownerRcIDList = ListWorks[i].OwnerReceive.Split(',').ToList();
                    List<object> userList = ownerRcIDList
                        .Join(ListUsers, rcId => rcId, us => us.CardID, (rcId, us) => new { us.Department, us.CardID, us.VnName, us.EnName, us.CnName })
                        .ToList<object>();
                    ListWorks[i].OwnerReceive = JsonConvert.SerializeObject(userList);
                }
                //check result
                if (ListWorks.Count < 1)
                {
                    return Json(new { Status = "fail", err = "Server get list work = null!", infoUser = infoUser }, JsonRequestBehavior.AllowGet);
                }
                if (infoUser == null)
                {
                    return Json(new { Status = "fail", err = "Server get list user = null" }, JsonRequestBehavior.AllowGet);
                }
                List<Model> models = db.Models1.ToList();
                return Json(new { status = "success", data = ListWorks, infoUser = infoUser, modelList = models }, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return Json(new { Status = "fail", err = "Get list work from server fail!" }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult AddWork(Work work)
        {
            string valiStatus = ValidationWork(work);
            if (valiStatus != "success")
            {
                return Json(new { error = valiStatus });
            }
            work.Flow = DEPARTMENT + "-" + DEPARTMENT;
            #region Save to database
            try
            {
                work.OwnerReceive.Replace(",", ", ");
                db.Works.Add(work);
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

                return Json(new { success = true, dataRow = work, model = db.Models1.ToList() });
            }
            catch
            {
                return Json(new { error = "Add work failed. Please double check or contact the administrator!" });
            }
            #endregion
        }
        public JsonResult EditWork(Work work, string changeTime, string userChange)
        {
            var record = db.Works.FirstOrDefault(r => r.ID == work.ID);

            string valiStatus = ValidationWork(work);
            if (valiStatus != "success")
            {
                return Json(new { error = ValidationWork(work) });
            }
            work.Flow = DEPARTMENT + "-" + DEPARTMENT;


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
                return Json(new { success = true, dataRow = work, model = db.Models1.ToList() });
            }
            catch (Exception ex)
            {
                return Json(new { error = "Edit work failed. Please double check or contact the administrator!" });
            }
            #endregion
        }      
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
        // function
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


            try
            {
                string depReq = db.Users.Single(u => u.CardID == work.OwnerRequest).Department;

                string[] ownerRcArr = work.OwnerReceive.Split(',');
                foreach (string ownerRc in ownerRcArr)
                {
                    string depRec = db.Users.Single(u => u.CardID == ownerRc).Department;
                    if (depReq != DEPARTMENT || depRec != DEPARTMENT)
                        return $"Please double check department. This page only {DEPARTMENT}";
                }
            }
            catch
            {
                return "Invalid Card ID, please contact the administrator to add an Card ID.";
            }
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