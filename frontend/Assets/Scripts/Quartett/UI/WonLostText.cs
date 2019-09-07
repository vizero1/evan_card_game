using System.Collections;
using System.Collections.Generic;
using TinyRoar.Framework;
using UnityEngine;
using UnityEngine.UI;

public class WonLostText : MonoBehaviour
{
    public bool IsWinText;
    public Text _text;


    void Start()
    {
        Events.Instance.OnGameplayStatusChange += GameplayStatusChange;
        _text = this.GetComponent<Text>();
        _text.enabled = false;
    }

    void OnDestroy()
    {
        Events.Instance.OnGameplayStatusChange -= GameplayStatusChange;
    }

    void GameplayStatusChange(GameplayStatus oldMatchStatus, GameplayStatus newMatchStatus)
    {
        switch (newMatchStatus)
        {
            case GameplayStatus.YouWon:
                if (IsWinText)
                {
                    EnableText();
                }
                break;
            case GameplayStatus.YouLost:
                if (!IsWinText)
                {
                    EnableText();
                }
                break;
        }
    }

    private void EnableText()
    {
        _text.enabled = true;
        Timer.Instance.Add(1.0f, () =>
        {
            _text.enabled = false;
        });
    }

}
