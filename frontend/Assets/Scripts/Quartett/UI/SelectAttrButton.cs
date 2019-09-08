using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;

public class SelectAttrButton : BaseButton
{
    public string AttributeName;

    protected override void ButtonAction()
    {
        Debug.Log("Attr" + AttributeName + " selected! :)");
        GameHandler.Instance.MakeMove(AttributeName);
        //LayerManager.Instance.SetAction(Layer.PlayCards, UIAction.Hide);
    }
}
