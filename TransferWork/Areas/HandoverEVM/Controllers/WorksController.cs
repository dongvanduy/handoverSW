using HandOver.Common;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.Entity.Migrations;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Threading;
using OfficeOpenXml;
using System.IO;

namespace HandOver.Areas.HandoverEVM.Controllers
{
    public class WorksController : BaseController
    {
        private readonly TransferWorkEntities db = new TransferWorkEntities();
        List<EVM> ListWorks = new List<EVM>();
        List<User> ListUsers = new List<User>();
        
        // GET: HandoverEVM/Works
        public ActionResult Index()
        {
            ViewBag.Role = MySession.USER_ROLE;
            return View();
        } //*
        public JsonResult AddEVM(EVM evm)
        {
            #region validation
            if (evm.Owner == null)
                return Json(new { status = "Owner null" });
            if (evm.Date < new DateTime(2000, 01, 01))
                return Json(new { status = "Date fail" });
            if (evm.Status == null)
                return Json(new { status = "Status null" });
            if (evm.Model == null)
            {
                return Json(new { status = "Model null" });
            }
            if (db.Users.SingleOrDefault(u => u.CardID == evm.Owner) == null)
            {
                return Json(new { status = "fail", err = "Owner invali. Please check again!" });
            }
            #endregion
            #region Add Model and Item
            Model md = db.Models1.FirstOrDefault(e => e.Model_ == evm.Model);
            if (md == null)
            {
                md = new Model();
                md.Model_ = evm.Model;
                db.Models1.Add(md);
                db.SaveChanges();
            }
            Dictionary<string, Dictionary<string, string>> obj = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(evm.Detail);

            foreach (var item in obj)
            {
                string innerItem = item.Value["Item"];
                Item it = db.Items.FirstOrDefault(i => i.Item_ == innerItem);
                if (it == null)
                {
                    it = new Item();
                    it.Item_ = innerItem;
                    db.Items.Add(it);
                    db.SaveChanges();
                }
            }
            #endregion
            #region Save to database
            try
            {
                db.EVMs.Add(evm);
                db.SaveChanges();
                User owner = db.Users.SingleOrDefault(u => u.CardID == evm.Owner);
                evm.Owner += "," + owner.Department + "," + owner.VnName + "," + owner.EnName + "," + owner.CnName;
                return Json(new { status = "success", dataRow = evm, model = db.Models1.ToList() });
            }
            catch (Exception ex)
            {
                return Json(new { status = "fail", err = ex });
            }
            #endregion
        } //*
        public JsonResult GetListWork()
        {
            try
            {
                ListWorks = db.EVMs.ToList();
                ListUsers = db.Users.Distinct().ToList();

                var infoUser = ListUsers.Select(u => new { Department = u.Department, CardID = u.CardID, VnName = u.VnName, EnName = u.EnName, CnName = u.CnName });
                for (int i = 0; i < ListWorks.Count; i++)
                {
                    if (MySession.USER_ROLE != 1)
                    {
                        if (MySession.USER_ACTIVE != 1)
                        {
                            if (ListWorks[i].Owner != MySession.USER_SESSION)
                            {
                                ListWorks[i].History = "{}";
                            }
                        }
                    }
                    User owner = ListUsers.SingleOrDefault(u => u.CardID == ListWorks[i].Owner);
                    ListWorks[i].Owner += "," + owner.Department + "," + owner.VnName + "," + owner.EnName + "," + owner.CnName;
                }
                //check result
                if (ListWorks.Count < 1)
                {
                    return Json(new { status = "fail", err = "Server get list work = null!", infoUser = infoUser }, JsonRequestBehavior.AllowGet);
                }
                if (infoUser == null)
                {
                    return Json(new { status = "fail", err = "Server get list user = null" }, JsonRequestBehavior.AllowGet);
                }
                
                return Json(new { status = "success", data = ListWorks, infoUser = infoUser, model = db.Models1.ToList() }, JsonRequestBehavior.AllowGet);
            }
            catch
            {
                return Json(new { status = "fail", err = "Get list work from server fail!" }, JsonRequestBehavior.AllowGet);
            }
        }//*
        public JsonResult DeleteWork(int id)
        {
            var record = db.EVMs.FirstOrDefault(r => r.ID == id);
            if (record == null)
                return Json(new { status = "not found" });
            else
            {
                if (MySession.USER_ROLE != 1)
                {
                    if (MySession.USER_ACTIVE != 1)
                    {
                        if (record.Owner != MySession.USER_SESSION)
                        {
                            return Json(new { status = "not access" });
                        }
                    }
                }
                try
                {
                    db.EVMs.Remove(record);
                    db.SaveChanges();
                    return Json(new { status = "success" });
                }
                catch
                {
                    return Json(new { status = "server error" });
                }
            }
        }
        public JsonResult GetWork(int id)
        {
            var record = db.EVMs.FirstOrDefault(r => r.ID == id);
            if (record == null) return Json(new { status = "not found" }); // khong tim thay ban ghi
            else
            {
                User user = db.Users.FirstOrDefault(u => u.CardID == record.Owner);
                user.Password = null;
                return Json(new { status = "success", data = record, ownerData = user }, JsonRequestBehavior.AllowGet);
            }
        }
        public JsonResult EditWork(EVM evm, string changeTime, string userChange)
        {
            #region validation
            if (evm.Owner == null)
                return Json(new { status = "Owner null" });
            if (evm.Date < new DateTime(2000, 01, 01))
                return Json(new { status = "Date fail" });
            if (evm.Status == null)
                return Json(new { status = "Status null" });
            if (evm.Model == null)
            {
                return Json(new { status = "Model null" });
            }
            try
            {
                User owner = db.Users.SingleOrDefault(u => u.CardID == evm.Owner);
                if (owner == null)
                    return Json(new { status = "fail", err = "Owner invali. Please check again!" });
            }
            catch { return Json(new { status = "fail", err = "Owner invali. Please check again!" }); }
            #endregion
            #region Add Model and Item
            Model md = db.Models1.FirstOrDefault(e => e.Model_ == evm.Model);
            if (md == null)
            {
                md = new Model();
                md.Model_ = evm.Model;
                db.Models1.Add(md);
                db.SaveChanges();
            }
            Dictionary<string, Dictionary<string, string>> obj = JsonConvert.DeserializeObject<Dictionary<string, Dictionary<string, string>>>(evm.Detail);

            foreach (var item in obj)
            {
                string innerItem = item.Value["Item"];
                Item it = db.Items.FirstOrDefault(i => i.Item_ == innerItem);
                if (it == null)
                {
                    it = new Item();
                    it.Item_ = innerItem;
                    db.Items.Add(it);
                    db.SaveChanges();
                }
            }
            db.SaveChanges();
            #endregion
            #region Create log change
            EVM _old = db.EVMs.SingleOrDefault(w => w.ID == evm.ID);
            evm.History = CreateChangeLog(userChange, changeTime, _old, evm);
            #endregion
            #region Save to database
            try
            {
                db.EVMs.AddOrUpdate(w => w.ID, evm);
                db.SaveChanges();
                User owner = db.Users.SingleOrDefault(u => u.CardID == evm.Owner);
                evm.Owner += "," + owner.Department + "," + owner.VnName + "," + owner.EnName + "," + owner.CnName;
                return Json(new { status = "Edit success", dataRow = evm, model = db.Models1.ToList() });
            }
            catch (Exception ex)
            {
                return Json(new { status = ex.Message });
            }
            #endregion
        }
        private string CreateChangeLog(string UserChange, string changeTime, EVM _old, EVM _new)
        {
            #region init
            JObject jsonObject = new JObject();
            JArray jsonArray = new JArray();
            #endregion

            #region check change
            if (_old.Status != _new.Status)
            {
                jsonArray.Add(new JObject(
                    new JProperty("User", UserChange),
                    new JProperty("Action", "Status"),
                    new JProperty("Old", _old.Status),
                    new JProperty("New", _new.Status)
                ));
            } //Status
            if (_old.Model != _new.Model)
            {
                jsonArray.Add(new JObject(
                    new JProperty("User", UserChange),
                    new JProperty("Action", "Model"),
                    new JProperty("Old", _old.Model),
                    new JProperty("New", _new.Model)
                ));
            } //Model
            if (_old.Date != _new.Date)
            {
                jsonArray.Add(new JObject(
                    new JProperty("User", UserChange),
                    new JProperty("Action", "Date"),
                    new JProperty("Old", _old.Date),
                    new JProperty("New", _new.Date)
                ));
            } //Date
            if (_old.Owner != _new.Owner)
            {
                jsonArray.Add(new JObject(
                    new JProperty("User", UserChange),
                    new JProperty("Action", "Owner"),
                    new JProperty("Old", _old.Owner),
                    new JProperty("New", _new.Owner)
                ));
            } //Owner         
            if (_old.Detail != _new.Detail)
            {
                jsonArray.Add(new JObject(
                    new JProperty("User", UserChange),
                    new JProperty("Action", "Item"),
                    new JProperty("Old", _old.Detail),
                    new JProperty("New", _new.Detail)
                ));
            } //Detail
            #endregion
            if (_old.History != null) // Has log
            {
                jsonObject = JObject.Parse(_old.History);
                if (jsonObject.ContainsKey(changeTime)) //has key => update key
                {
                    JArray arrFirst = (JArray)jsonObject[changeTime];
                    arrFirst.Merge(jsonArray);
                }
                else
                {
                    if (jsonArray.Count > 0)
                    {
                        jsonObject.Add(changeTime, jsonArray);
                    }
                    else
                    {
                        return JsonConvert.SerializeObject(jsonObject);
                    }
                }
            }
            else // Hasn't log + hasn't key
            {
                if (jsonArray.Count > 0)
                {
                    jsonObject.Add(changeTime, jsonArray);
                }
                else
                {
                    return JsonConvert.SerializeObject(jsonObject);
                }
            }
            return JsonConvert.SerializeObject(jsonObject);
        }

        
    }
}