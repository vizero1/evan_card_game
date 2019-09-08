using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[System.Serializable]
public class StatusDto
{
    public bool hasOpponent;
    public CardDto currenCard;
    public bool myTurn;
    public string attributeLastRound;
}
