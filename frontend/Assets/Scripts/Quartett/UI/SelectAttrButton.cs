using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;

public class SelectAttrButton : BaseButton
{
    public int Id;

    protected override void ButtonAction()
    {
        GameHandler.Instance.MakeMove(Id);
        LayerManager.Instance.SetAction(Layer.PlayCards, UIAction.Hide);
    }
}
