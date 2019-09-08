using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;
using UnityEngine.UI;

public class Persons : MonoBehaviour
{
    public bool IsMe;
    private Image _img;


    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        _img = this.GetComponent<Image>();
        _img.enabled = false;
    }

    void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.GameRunning:
                if (IsMe)
                {
                    EnableText();
                }
                break;
            case GameplayStatus.OpponentReady:
                if (!IsMe)
                {
                    EnableText();
                }
                break;
        }
    }

    private void EnableText()
    {
        _img.enabled = true;
    }
}
